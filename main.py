"""
ChillTax - Backend API
FastAPI + Google Gemini (Vision) สำหรับวิเคราะห์สลิปโอนเงิน/ใบเสร็จ และจัดหมวดหมู่ภาษี
+ SQLite (SQLModel) สำหรับเก็บรายการธุรกรรม และ API สำหรับ Front-end
"""

import hashlib
import json
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pydantic import BaseModel, Field, ValidationError, field_validator, model_validator
from sqlalchemy import func, text
from sqlmodel import Field as SQLField
from sqlmodel import Session, SQLModel, create_engine, select

load_dotenv()

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"}

CONFIDENCE_THRESHOLD = 80  # >= 80 -> confirmed, < 80 -> pending
VAT_THRESHOLD = 1_800_000  # เกณฑ์รายรับที่ต้องจดทะเบียน VAT (บาท/ปี)

if not GEMINI_API_KEY:
    raise RuntimeError("ไม่พบ GEMINI_API_KEY กรุณาตั้งค่าในไฟล์ .env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("chilltax")

client = genai.Client(api_key=GEMINI_API_KEY)

# ---------------------------------------------------------------------------
# Database (SQLite: tax.db อยู่โฟลเดอร์เดียวกับ main.py)
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
DATABASE_URL = f"sqlite:///{BASE_DIR / 'tax.db'}"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


def get_session():
    with Session(engine) as session:
        yield session


# ---------------------------------------------------------------------------
# System Prompt
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """คุณคือ AI ผู้เชี่ยวชาญด้านบัญชีและภาษีของประเทศไทย หน้าที่ของคุณคือสกัดข้อมูลจากภาพสลิปโอนเงินหรือใบเสร็จ และวิเคราะห์หมวดหมู่ทางภาษี คืนค่าเป็น JSON โครงสร้างดังนี้:
{
"transaction_date": "YYYY-MM-DD HH:MM",
"sender_name": "ชื่อผู้โอน",
"receiver_name": "ชื่อผู้รับโอน / ชื่อร้าน",
"amount": ตัวเลขทศนิยม 2 ตำแหน่ง,
"memo": "บันทึกช่วยจำ (ถ้าไม่มีใส่ null)",
"has_memo_warning": true | false,
"tax_category": "income_40_1" | "income_40_2" | "income_40_3" | "income_40_4" | "income_40_5" | "income_40_6" | "income_40_7" | "income_40_8" | "expense_business" | "expense_personal" | "deduction_insurance" | "deduction_donation" | "deduction_thaiesg" | "deduction_solar" | "deduction_shopping" | "deduction_medical" | "unknown",
"confidence_score": ตัวเลข 0-100,
"reasoning": "จัดหมวดหมู่นี้เพราะบันทึกช่วยจำระบุว่า... หรือเหตุผลทางภาษี"
}

กฎการประเมินบันทึกช่วยจำ (has_memo_warning):
- ถ้าภาพสลิปไม่มีการเขียนบันทึกช่วยจำ (memo เป็น null หรือ ว่างเปล่า) ให้ค่า has_memo_warning เป็น true
- ถ้ามีบันทึกช่วยจำอยู่แล้ว ให้ค่า has_memo_warning เป็น false
- หากไม่มีบันทึกช่วยจำ (has_memo_warning = true) ให้ AI พยายามเดา tax_category จากชื่อผู้รับโอนและบริบทอื่นๆ แทน พร้อมให้ confidence_score ลดต่ำลง (เช่น < 60)

กฎการตัดสินที่สำคัญที่สุด: ให้ให้น้ำหนักกับ 'บันทึกช่วยจำ (Memo)' และ 'ชื่อผู้รับโอน' ในการจัดหมวดหมู่:
1. หมวดรายรับ (Income มาตรา 40 ทั้ง 8 ประเภท):
   - income_40_1 (เงินเดือน/โบนัส): มีคำว่า 'เงินเดือน', 'Salary', 'Payroll', 'โบนัส', 'Bonus' หรือโอนจากบัญชีบริษัทเป็นยอดประจำเดือน
   - income_40_2 (รับจ้างอิสระ/นายหน้า): มีคำว่า 'ค่าจ้าง', 'จ้างทำ...', 'ค่าคอม', 'ค่านายหน้า', 'ฟรีแลนซ์', 'Freelance', 'ค่าบริการงาน', 'ค่าที่ปรึกษา'
   - income_40_3 (ค่าลิขสิทธิ์/ทรัพย์สินทางปัญญา): มีคำว่า 'ลิขสิทธิ์', 'Royalty', 'สิทธิบัตร', 'เครื่องหมายการค้า', 'Goodwill'
   - income_40_4 (ดอกเบี้ย/เงินปันผล/คริปโต): มีคำว่า 'ดอกเบี้ย', 'เงินปันผล', 'Dividend', 'Interest', 'Staking', 'Crypto Profit'
   - income_40_5 (ค่าเช่าทรัพย์สิน): มีคำว่า 'ค่าเช่า', 'เช่าบ้าน', 'เช่าคอนโด', 'เช่าตึก', 'เช่าที่ดิน', 'Rent'
   - income_40_6 (วิชาชีพอิสระ): ค่าประกอบโรคศิลปะ/แพทย์, กฎหมาย/ทนายความ, วิศวกรรม, สถาปัตยกรรม, บัญชี, ประณีตศิลป์
   - income_40_7 (รับเหมาก่อสร้าง จัดหาสัมภาระ): มีคำว่า 'รับเหมา', 'รับเหมาก่อสร้าง', 'สัญญาจ้างเหมาเบ็ดเสร็จ'
   - income_40_8 (ธุรกิจ/ขายสินค้า/พาณิชย์/อื่นๆ): มีคำว่า 'ค่าสินค้า', 'ค่าของ', 'ซื้อ...', 'ขายของ', 'ออเดอร์', 'Order' หรือเป็นยอดโอนยิบย่อยจากบุคคลธรรมดาหลายๆ คน
2. หมวดสิทธิลดหย่อนภาษี (Deductions):
   - deduction_insurance (เบี้ยประกันภัย/ชีวิต): มีคำว่า 'เบี้ยประกันภัย', 'ประกันชีวิต', 'ประกันสุขภาพ', 'เบี้ยประกัน' หรือผู้รับเป็นบริษัทประกัน เช่น AIA, FWD, เมืองไทยประกันชีวิต, อลิอันซ์, กรุงเทพประกันชีวิต, ทิพยประกันภัย, ชับบ์
   - deduction_donation (เงินบริจาค/ทำบุญ): มีคำว่า 'บริจาค', 'ทำบุญ', 'วัด', 'มูลนิธิ', 'โรงพยาบาล', 'กาชาด', 'ศิริราช', 'e-Donation', 'การศึกษา', 'โรงเรียน'
   - deduction_thaiesg (กองทุน Thai ESG): มีคำว่า 'Thai ESG', 'กองทุนรวมเพื่อความยั่งยืน', 'TESG', 'กองทุนรวมไทยเพื่อความยั่งยืน', 'กองทุนยั่งยืน'
   - deduction_solar (ค่าติดตั้งโซลาร์เซลล์): มีคำว่า 'โซลาร์เซลล์', 'On-Grid', 'Solar Cell', 'Solar Rooftop', 'แผงโซลาร์', 'ติดตั้งโซลาร์'
   - deduction_shopping (ค่าซื้อสินค้าลดหย่อนภาษี/Easy E-Receipt): มีคำว่า 'ช้อปดีมีคืน', 'Easy E-Receipt', 'ใบกำกับภาษีเต็มรูป', 'บิล VAT', 'Tax Invoice'
   - deduction_medical (ค่าฝากครรภ์/คลอดบุตร): มีคำว่า 'คลอดบุตร', 'ฝากครรภ์', 'สูตินรีเวช', 'ตรวจครรภ์'
3. หมวดรายจ่ายธุรกิจ:
   - expense_business: ถ้ามีคำว่า 'สต็อก', 'ซัพพลายเออร์', 'วัตถุดิบ', 'ออฟฟิศ', 'ค่าโฆษณา', 'อุปกรณ์', 'ค่าเซิร์ฟเวอร์' ในบันทึกช่วยจำ หรือผู้รับเป็นนิติบุคคล (บจก., บมจ., หจก.)
4. หมวดรายจ่ายส่วนตัว:
   - expense_personal: ถ้ามีคำว่า 'กินข้าว', 'ดูหนัง', 'ช้อปปิ้ง', 'ส่วนตัว', 'ให้แม่', 'หมูกระทะ', 'กาแฟ' ในบันทึกช่วยจำ หรือเป็นบุคคลธรรมดาและไม่มีบันทึกช่วยจำ
5. กรณีอื่นที่ไม่สามารถระบุได้ชัดเจน -> tax_category = 'unknown', confidence_score < 50

ข้อกำหนดเรื่องเหตุผล (Reasoning):
- ให้ระบุใน reasoning เสมอในรูปแบบ: 'จัดหมวดหมู่นี้เพราะบันทึกช่วยจำระบุว่า [ข้อความ/คำสำคัญ]' หรือ 'จัดหมวดหมู่นี้เนื่องจากผู้รับโอนคือ [ชื่อผู้รับ]'

หมายเหตุเพิ่มเติม:
- ถ้าวันที่บนสลิปเป็นปี พ.ศ. ให้แปลงเป็น ค.ศ. (ลบ 543) ก่อนใส่ใน transaction_date
- ถ้าอ่านข้อมูลช่องใดไม่ได้ ให้ใส่ null
- ถ้าภาพไม่ใช่สลิปหรือใบเสร็จ ให้ tax_category = 'unknown' และ confidence_score = 0
"""


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class TaxCategory(str, Enum):
    income_40_1 = "income_40_1"
    income_40_2 = "income_40_2"
    income_40_3 = "income_40_3"
    income_40_4 = "income_40_4"
    income_40_5 = "income_40_5"
    income_40_6 = "income_40_6"
    income_40_7 = "income_40_7"
    income_40_8 = "income_40_8"
    expense_business = "expense_business"
    expense_personal = "expense_personal"
    deduction_insurance = "deduction_insurance"
    deduction_donation = "deduction_donation"
    deduction_thaiesg = "deduction_thaiesg"
    deduction_solar = "deduction_solar"
    deduction_shopping = "deduction_shopping"
    deduction_medical = "deduction_medical"
    unknown = "unknown"


class TxStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"


class GeminiSlipSchema(BaseModel):
    """Schema ที่ส่งให้ Gemini ใช้บังคับโครงสร้าง JSON (ไม่มี constraint เพื่อความเข้ากันได้)"""

    transaction_date: Optional[str]
    sender_name: Optional[str]
    receiver_name: Optional[str]
    amount: Optional[float]
    memo: Optional[str]
    has_memo_warning: bool = False
    tax_category: TaxCategory
    confidence_score: int
    reasoning: str


class SlipAnalysisResult(BaseModel):
    """Schema สำหรับ validate ผลลัพธ์ก่อนส่งกลับไปยัง client"""

    transaction_date: Optional[str] = None
    sender_name: Optional[str] = None
    receiver_name: Optional[str] = None
    amount: Optional[float] = None
    memo: Optional[str] = None
    has_memo_warning: bool = False
    tax_category: TaxCategory = TaxCategory.unknown
    confidence_score: int = Field(0, ge=0, le=100)
    reasoning: str = ""

    @field_validator("amount")
    @classmethod
    def round_amount(cls, v):
        return round(v, 2) if v is not None else None

    @field_validator("confidence_score", mode="before")
    @classmethod
    def clamp_score(cls, v):
        try:
            return max(0, min(100, int(float(v))))
        except (TypeError, ValueError):
            return 0

    @field_validator("memo", mode="before")
    @classmethod
    def empty_memo_to_none(cls, v):
        if isinstance(v, str) and v.strip().lower() in {"", "null", "none", "-"}:
            return None
        return v

    @model_validator(mode="after")
    def validate_memo_warning(self):
        # ถ้าไม่มี memo ให้เปิด warning flag เป็น True เสมอ
        if not self.memo or not str(self.memo).strip():
            self.has_memo_warning = True
        return self


class Transaction(SQLModel, table=True):
    """ตาราง transactions"""

    __tablename__ = "transactions"

    id: Optional[int] = SQLField(default=None, primary_key=True)
    transaction_date: Optional[str] = None
    sender_name: Optional[str] = None
    receiver_name: Optional[str] = None
    amount: Optional[float] = None
    memo: Optional[str] = None
    has_memo_warning: bool = SQLField(default=False)
    tax_category: str = SQLField(default=TaxCategory.unknown.value, index=True)
    confidence_score: int = 0
    reasoning: str = ""
    status: str = SQLField(default=TxStatus.pending.value, index=True)
    created_at: datetime = SQLField(default_factory=lambda: datetime.now(timezone.utc))


def hash_password(password: str) -> str:
    """สร้าง SHA-256 Hash สำหรับเก็บรหัสผ่านผู้ใช้อย่างปลอดภัย"""
    return hashlib.sha256(password.strip().encode("utf-8")).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    """ตรวจสอบรหัสผ่านเทียบกับ hash ในฐานข้อมูล"""
    if not hashed:
        return False
    return hash_password(password) == hashed


class User(SQLModel, table=True):
    """ตาราง users สำหรับเก็บโปรไฟล์ผู้เสียภาษีและสถานะสิทธิ์ลดหย่อน"""

    __tablename__ = "users"

    id: Optional[int] = SQLField(default=None, primary_key=True)
    email: str = SQLField(index=True, unique=True)
    fullname: Optional[str] = "ผู้เสียภาษี"
    password_hash: Optional[str] = SQLField(default=None)  # SHA-256 hash รหัสผ่าน
    status_type: str = SQLField(default="single")  # single, married_no_income, married_has_income
    spouse_has_income: bool = SQLField(default=False)  # คู่สมรสมีเงินได้หรือไม่ (ถ้า False ลดหย่อนได้ 60,000)
    child_first_count: int = SQLField(default=0)  # บุตรคนแรก หรือเกิดก่อนปี 2561 (30,000 บ./คน)
    child_second_plus_count: int = SQLField(default=0)  # บุตรคนที่ 2 ขึ้นไปเกิดปี 2561 เป็นต้นไป (60,000 บ./คน)
    child_count: int = SQLField(default=0)  # จำนวนบุตรรวม
    disabled_parent_count: int = SQLField(default=0)  # จำนวนพ่อแม่ที่ต้องดูแล (30,000 บ./คน สูงสุด 4 ท่าน)
    social_security: float = SQLField(default=10500.0)  # ยอดส่งประกันสังคมต่อปี (เพดานใหม่ปี 2569 สูงสุด 10,500)
    created_at: datetime = SQLField(default_factory=lambda: datetime.now(timezone.utc))


class Deduction(SQLModel, table=True):
    """ตาราง deductions สำหรับเก็บประวัติค่าลดหย่อนจากการสแกนบิล/ใบเสร็จ"""

    __tablename__ = "deductions"

    id: Optional[int] = SQLField(default=None, primary_key=True)
    user_email: str = SQLField(index=True)
    type: str = SQLField(index=True)  # deduction_insurance, deduction_donation, deduction_thaiesg, deduction_solar, deduction_shopping, deduction_medical
    title: Optional[str] = None
    amount: float = 0.0
    transaction_date: Optional[str] = None
    note: Optional[str] = None
    created_at: datetime = SQLField(default_factory=lambda: datetime.now(timezone.utc))


class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = None


class RegisterRequest(BaseModel):
    email: str
    password: str
    fullname: Optional[str] = None


class UserProfileUpdate(BaseModel):
    email: str
    fullname: Optional[str] = None
    status_type: Optional[str] = None
    spouse_has_income: Optional[bool] = None
    child_first_count: Optional[int] = None
    child_second_plus_count: Optional[int] = None
    child_count: Optional[int] = None
    disabled_parent_count: Optional[int] = None
    social_security: Optional[float] = None


class DeductionSummaryResponse(BaseModel):
    email: str
    fullname: str
    status_type: str
    spouse_has_income: bool = False
    child_first_count: int = 0
    child_second_plus_count: int = 0
    child_count: int = 0
    disabled_parent_count: int = 0
    social_security: float = 0.0
    personal_allowance: float
    spouse_allowance: float
    child_first_allowance: float = 0.0
    child_second_plus_allowance: float = 0.0
    child_allowance: float
    parent_allowance: float
    social_security_allowance: float
    total_personal_family: float
    total_scanned_deductions: float
    grand_total_deductions: float
    scanned_items: List[Deduction]
    category_totals: dict
    breakdown_details: Optional[dict] = None


class AnalyzeResponse(BaseModel):
    success: bool
    filename: Optional[str]
    model: str
    data: Transaction  # ผลวิเคราะห์ + id/status ที่บันทึกลง DB แล้ว


class ConfirmRequest(BaseModel):
    tax_category: Optional[TaxCategory] = None  # ไม่ส่งมา = ใช้หมวดเดิมที่ AI จัดไว้


class DashboardStats(BaseModel):
    income_40_1: float = 0.0
    income_40_2: float = 0.0
    income_40_3: float = 0.0
    income_40_4: float = 0.0
    income_40_5: float = 0.0
    income_40_6: float = 0.0
    income_40_7: float = 0.0
    income_40_8: float = 0.0
    total_income: float
    total_expense_business: float
    net_profit: float
    expense_40_1_2: float = 0.0
    expense_40_3: float = 0.0
    expense_40_4: float = 0.0
    expense_40_5: float = 0.0
    expense_40_6: float = 0.0
    expense_40_7: float = 0.0
    expense_40_8_deductible: float = 0.0
    expense_40_8_choice: str = "flat_60pct"  # "flat_60pct" | "actual"
    expense_40_8_flat: float = 0.0
    total_expense_deductible: float = 0.0
    income_after_expenses: float = 0.0
    grand_total_deductions: float = 0.0
    net_taxable_income: float = 0.0
    estimated_income_tax: float
    tax_brackets_detail: list = []
    current_bracket: int = 0
    current_bracket_label: str = "0% (ยกเว้น)"
    next_bracket: Optional[int] = 5
    next_bracket_label: Optional[str] = "5%"
    amount_to_next_bracket: float = 0.0
    bracket_progress_percent: float = 0.0
    bracket_nudge_text: str = ""
    estimated_vat: float
    vat_status_label: str = "ยังไม่ถึงเกณฑ์จด VAT"
    vat_due_date: str
    income_tax_due_date: str
    pending_count: int
    vat_threshold: float
    vat_progress_percent: float


# ---------------------------------------------------------------------------
# Startup: สร้างตาราง + Mock Data
# ---------------------------------------------------------------------------
MOCK_TRANSACTIONS = [
    Transaction(
        transaction_date="2026-10-01 09:30",
        sender_name="บจก. เทค อินโนเวชั่น (Payroll)",
        receiver_name="นาย ชิล แท็กซ์",
        amount=50000.00,
        memo="Salary เงินเดือนประจำเดือน 10/2026",
        tax_category=TaxCategory.income_40_1.value,
        confidence_score=98,
        reasoning="โอนเข้าจากบัญชีเงินเดือนบริษัทพร้อมระบุ Salary จัดเป็นเงินได้ 40(1)",
        status=TxStatus.confirmed.value,
        has_memo_warning=False,
    ),
    Transaction(
        transaction_date="2026-10-04 11:20",
        sender_name="บจก. ครีเอทีฟ ดิจิทัล",
        receiver_name="นาย ชิล แท็กซ์",
        amount=45000.00,
        memo="ค่าจ้างออกแบบ UI/UX แอปพลิเคชัน ฟรีแลนซ์",
        tax_category=TaxCategory.income_40_2.value,
        confidence_score=96,
        reasoning="บันทึกช่วยจำระบุค่าจ้างออกแบบงานฟรีแลนซ์ จัดเป็นเงินได้ 40(2)",
        status=TxStatus.confirmed.value,
        has_memo_warning=False,
    ),
    Transaction(
        transaction_date="2026-10-06 15:45",
        sender_name="น.ส. รัตนา ช้อปปิ้ง",
        receiver_name="นาย ชิล แท็กซ์ (ChillShop)",
        amount=120000.00,
        memo="ค่าสินค้าเซ็ต A + ค่าจัดส่งด่วน",
        tax_category=TaxCategory.income_40_8.value,
        confidence_score=94,
        reasoning="บันทึกช่วยจำระบุค่าสินค้าจากการค้าขาย จัดเป็นเงินได้ 40(8)",
        status=TxStatus.confirmed.value,
        has_memo_warning=False,
    ),
    Transaction(
        transaction_date="2026-10-07 14:32",
        sender_name="นาย ชิล แท็กซ์",
        receiver_name="บจก. ไอที ซัพพลาย",
        amount=15000.00,
        memo="ค่าอุปกรณ์สำนักงานและสต็อกสินค้า",
        tax_category=TaxCategory.expense_business.value,
        confidence_score=92,
        reasoning="ผู้รับเป็นนิติบุคคลและ memo ระบุเป็นค่าสต็อกสินค้าเพื่อธุรกิจ",
        status=TxStatus.confirmed.value,
        has_memo_warning=False,
    ),
    # Pending items for Speed Review (ตรวจบิล)
    Transaction(
        transaction_date="2026-10-11 16:15",
        sender_name="บจก. มีเดีย พลัส เอเจนซี่",
        receiver_name="นาย ชิล แท็กซ์",
        amount=28000.00,
        memo="ค่าจ้างเขียนคอนเทนต์รีวิวสินค้า Freelance",
        tax_category=TaxCategory.income_40_2.value,
        confidence_score=95,
        reasoning="AI ประเมินเป็นเงินได้ 40(2) จากคีย์เวิร์ดค่าจ้างคอนเทนต์ฟรีแลนซ์",
        status=TxStatus.pending.value,
        has_memo_warning=False,
    ),
    Transaction(
        transaction_date="2026-10-13 13:40",
        sender_name="นาย มานะ ค้าดี",
        receiver_name="นาย ชิล แท็กซ์",
        amount=3500.00,
        memo="ค่าสินค้าออเดอร์ #4092",
        tax_category=TaxCategory.income_40_8.value,
        confidence_score=90,
        reasoning="AI ประเมินเป็นเงินได้ 40(8) จากการขายสินค้าพาณิชย์",
        status=TxStatus.pending.value,
        has_memo_warning=False,
    ),
    Transaction(
        transaction_date="2026-10-14 18:20",
        sender_name="นาย ชิล แท็กซ์",
        receiver_name="นาย สุขใจ มีทรัพย์",
        amount=950.00,
        memo=None,
        tax_category=TaxCategory.unknown.value,
        confidence_score=35,
        reasoning="ผู้รับเป็นบุคคลธรรมดาและไม่มี memo ต้องให้ผู้ใช้ตรวจสอบ",
        status=TxStatus.pending.value,
        has_memo_warning=True,
    ),
]

MOCK_DEDUCTIONS = [
    Deduction(
        user_email="demo@chilltax.com",
        type="deduction_insurance",
        title="บมจ. เอไอเอ (เบี้ยประกันชีวิต)",
        amount=25000.0,
        transaction_date="2026-09-15 11:20",
        note="ชำระเบี้ยประกันชีวิตประจำปี หักลดหย่อนได้สูงสุด 100,000 บาท",
    ),
    Deduction(
        user_email="demo@chilltax.com",
        type="deduction_donation",
        title="ศิริราชมูลนิธิ (e-Donation)",
        amount=3000.0,
        transaction_date="2026-10-02 14:15",
        note="บริจาคสมทบทุนจัดซื้ออุปกรณ์การแพทย์ โรงพยาบาลรัฐ (สิทธิหักลดหย่อน 2 เท่า)",
    ),
    Deduction(
        user_email="demo@chilltax.com",
        type="deduction_shopping",
        title="Central Department Store (Easy E-Receipt)",
        amount=12500.0,
        transaction_date="2026-10-10 16:45",
        note="ซื้ออุปกรณ์สำนักงาน ใบกำกับภาษีอิเล็กทรอนิกส์เต็มรูป",
    ),
    Deduction(
        user_email="demo@chilltax.com",
        type="deduction_thaiesg",
        title="BBLAM Thai ESG (กองทุนรวมบัวหลวงเพื่อความยั่งยืน)",
        amount=50000.0,
        transaction_date="2026-10-12 10:30",
        note="กองทุน Thai ESG สิทธิลดหย่อนไม่เกิน 30% ของเงินได้ สูงสุด 300,000 บาท",
    ),
    Deduction(
        user_email="demo@chilltax.com",
        type="deduction_solar",
        title="SCG Solar Roof (ค่าติดตั้งโซลาร์เซลล์ On-Grid)",
        amount=89000.0,
        transaction_date="2026-10-14 15:00",
        note="สิทธิลดหย่อนติดตั้งโซลาร์เซลล์บ้านพักอาศัยปี 2569 สูงสุด 200,000 บาท",
    ),
]


def init_db() -> None:
    SQLModel.metadata.create_all(engine)
    with engine.connect() as conn:
        # ไมเกรชันตาราง transactions
        try:
            conn.execute(text("ALTER TABLE transactions ADD COLUMN has_memo_warning BOOLEAN DEFAULT 0"))
            conn.commit()
        except Exception:
            pass
        try:
            conn.execute(text("UPDATE transactions SET has_memo_warning = 1 WHERE memo IS NULL OR trim(memo) = ''"))
            conn.commit()
        except Exception:
            pass

        # ไมเกรชันตาราง users สำหรับกฎหมายปี 2569 และระบบรหัสผ่าน
        user_cols = [
            "password_hash TEXT",
            "spouse_has_income BOOLEAN DEFAULT 0",
            "child_first_count INTEGER DEFAULT 0",
            "child_second_plus_count INTEGER DEFAULT 0",
        ]
        for ucol in user_cols:
            try:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {ucol}"))
                conn.commit()
            except Exception:
                pass

    with Session(engine) as session:
        # Mock Transactions
        has_tx = session.exec(select(Transaction.id).limit(1)).first()
        has_40_1 = session.exec(select(Transaction.id).where(Transaction.tax_category == TaxCategory.income_40_1.value).limit(1)).first()
        if has_tx is None or has_40_1 is None:
            session.add_all(
                [Transaction.model_validate(t.model_dump(exclude={"id", "created_at"})) for t in MOCK_TRANSACTIONS]
            )
            session.commit()
            logger.info("Inserted %d mock transactions", len(MOCK_TRANSACTIONS))

        # Default Demo User
        demo_user = session.exec(select(User).where(User.email == "demo@chilltax.com")).first()
        if demo_user is None:
            demo_user = User(
                email="demo@chilltax.com",
                fullname="คุณชิล แท็กซ์ (บัญชีทดสอบ)",
                password_hash=hash_password("123456"),
                status_type="single",
                spouse_has_income=False,
                child_first_count=0,
                child_second_plus_count=0,
                child_count=0,
                disabled_parent_count=1,
                social_security=10500.0,
            )
            session.add(demo_user)
            session.commit()
            logger.info("Created default demo user: demo@chilltax.com")
        else:
            # ตั้งรหัสผ่านเริ่มต้น 123456 ให้บัญชี demo หากยังไม่มี
            if not demo_user.password_hash:
                demo_user.password_hash = hash_password("123456")
                session.add(demo_user)
                session.commit()
            # อัปเกรดเพดานประกันสังคมเป็น 10,500 ถ้ายังเป็น 9,000
            if demo_user.social_security == 9000.0:
                demo_user.social_security = 10500.0
                session.add(demo_user)
                session.commit()

        # Mock Deductions: เช็คว่ามี Thai ESG และ Solar หรือยัง ถ้ายังให้เติมเพิ่ม
        existing_types = set(session.exec(select(Deduction.type).where(Deduction.user_email == "demo@chilltax.com")).all())
        missing_mocks = [d for d in MOCK_DEDUCTIONS if d.type not in existing_types]
        if missing_mocks:
            session.add_all(missing_mocks)
            session.commit()
            logger.info("Inserted %d additional mock deductions", len(missing_mocks))


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event
    init_db()
    yield


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="ChillTax API",
    description="วิเคราะห์สลิปโอนเงิน/ใบเสร็จด้วย Gemini และจัดหมวดหมู่ภาษีไทย",
    version="1.1.0",
    lifespan=lifespan,
)

# CORS: อนุญาตทุก origin เพื่อให้ Mobile App / Web Frontend เชื่อมต่อได้
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "model": GEMINI_MODEL}


@app.post("/api/analyze-slip", response_model=AnalyzeResponse)
async def analyze_slip(
    file: UploadFile = File(..., description="ไฟล์รูปสลิปหรือใบเสร็จ"),
    user_email: Optional[str] = Query("demo@chilltax.com"),
    session: Session = Depends(get_session),
):
    # 1) Validate & normalize file MIME type (รองรับมือถือ Android/iOS ที่บางครั้งส่ง image/jpg หรือ octet-stream)
    raw_mime = (file.content_type or "").lower().strip()
    if raw_mime == "image/jpg":
        mime_type = "image/jpeg"
    elif raw_mime in ALLOWED_MIME_TYPES:
        mime_type = raw_mime
    else:
        fname = (file.filename or "").lower()
        if fname.endswith(".png"):
            mime_type = "image/png"
        elif fname.endswith(".webp"):
            mime_type = "image/webp"
        elif fname.endswith(".heic"):
            mime_type = "image/heic"
        elif fname.endswith(".heif"):
            mime_type = "image/heif"
        else:
            mime_type = "image/jpeg"

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="ไฟล์ว่างเปล่า")
    if len(image_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"ไฟล์ใหญ่เกิน {MAX_FILE_SIZE_MB} MB")

    # 2) Call Gemini - บังคับให้ตอบเป็น JSON เสมอ
    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        response_mime_type="application/json",  # <-- จุดสำคัญ: บังคับ JSON
        response_schema=GeminiSlipSchema,  # <-- ล็อกโครงสร้าง field ให้ตรงเป๊ะ
        temperature=0.1,
    )

    response = None
    last_err = None
    used_model = GEMINI_MODEL
    candidate_models = [GEMINI_MODEL, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-3.5-flash", "gemini-2.5-pro"]
    seen = set()
    candidate_models = [m for m in candidate_models if not (m in seen or seen.add(m))]

    for model_cand in candidate_models:
        try:
            logger.info("Attempting slip analysis with model %s (mime=%s, size=%d bytes)", model_cand, mime_type, len(image_bytes))
            response = await client.aio.models.generate_content(
                model=model_cand,
                contents=[
                    types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                    "วิเคราะห์สลิป/ใบเสร็จในภาพนี้ แล้วตอบกลับเป็น JSON ตามโครงสร้างที่กำหนด",
                ],
                config=config,
            )
            used_model = model_cand
            break
        except Exception as e:
            last_err = e
            logger.warning("Model %s failed: %s, trying next candidate...", model_cand, e)

    if response is None:
        logger.exception("All Gemini model candidates failed")
        raise HTTPException(status_code=502, detail=f"เรียก Gemini API ไม่สำเร็จ: {last_err}")

    # 3) Parse & validate JSON
    raw_text = response.text or ""
    try:
        parsed = json.loads(raw_text)
        result = SlipAnalysisResult.model_validate(parsed)
    except (json.JSONDecodeError, ValidationError) as e:
        logger.error("Invalid JSON from Gemini: %s | raw=%s", e, raw_text)
        raise HTTPException(
            status_code=502,
            detail={"message": "Gemini ตอบกลับในรูปแบบที่ไม่ถูกต้อง", "raw": raw_text},
        )

    # 4) บันทึกรายการลง DB เป็นสถานะ pending เพื่อให้เข้าสู่หน้า 'Speed Review (บิลที่รอตรวจ)'
    tx = Transaction(
        **result.model_dump(exclude={"tax_category"}),
        tax_category=result.tax_category.value,
        status=TxStatus.pending.value,
    )
    session.add(tx)
    session.commit()
    session.refresh(tx)

    # 5) ถ้า AI วิเคราะห์ว่าเป็นหมวดค่าลดหย่อนภาษี (deduction_*) ให้บันทึกเข้าตาราง deductions ด้วย
    if tx.tax_category.startswith("deduction_"):
        ded = Deduction(
            user_email=(user_email or "demo@chilltax.com").strip().lower(),
            type=tx.tax_category,
            title=tx.receiver_name or "สลิปค่าลดหย่อนภาษี",
            amount=tx.amount or 0.0,
            transaction_date=tx.transaction_date,
            note=tx.memo or tx.reasoning,
        )
        session.add(ded)
        session.commit()
        logger.info("Auto-inserted deduction record for %s: %s (฿%s)", user_email, ded.type, ded.amount)

    logger.info(
        "Analyzed %s -> id=%s %s (%s) status=%s",
        file.filename, tx.id, tx.tax_category, tx.confidence_score, tx.status,
    )
    return AnalyzeResponse(success=True, filename=file.filename, model=used_model, data=tx)


@app.get("/api/transactions", response_model=List[Transaction])
def list_transactions(
    status: Optional[TxStatus] = Query(None, description="กรองตามสถานะ เช่น ?status=pending"),
    session: Session = Depends(get_session),
):
    stmt = select(Transaction)
    if status is not None:
        stmt = stmt.where(Transaction.status == status.value)
    stmt = stmt.order_by(Transaction.transaction_date.desc(), Transaction.id.desc())
    return session.exec(stmt).all()


@app.put("/api/transactions/{tx_id}/confirm", response_model=Transaction)
def confirm_transaction(
    tx_id: int,
    body: Optional[ConfirmRequest] = None,
    user_email: Optional[str] = Query("demo@chilltax.com"),
    session: Session = Depends(get_session),
):
    tx = session.get(Transaction, tx_id)
    if tx is None:
        raise HTTPException(status_code=404, detail=f"ไม่พบรายการ id={tx_id}")

    if body is not None and body.tax_category is not None:
        tx.tax_category = body.tax_category.value
        # ถ้าเปลี่ยนเป็นหมวดลดหย่อนภาษี ให้เพิ่มเข้าตาราง deductions
        if tx.tax_category.startswith("deduction_"):
            ded = Deduction(
                user_email=(user_email or "demo@chilltax.com").strip().lower(),
                type=tx.tax_category,
                title=tx.receiver_name or "สลิปค่าลดหย่อนภาษี",
                amount=tx.amount or 0.0,
                transaction_date=tx.transaction_date,
                note=tx.memo or tx.reasoning,
            )
            session.add(ded)

    tx.status = TxStatus.confirmed.value

    session.add(tx)
    session.commit()
    session.refresh(tx)
    return tx


@app.put("/api/transactions/{tx_id}/update", response_model=Transaction)
def update_transaction(
    tx_id: int,
    body: Optional[ConfirmRequest] = None,
    user_email: Optional[str] = Query("demo@chilltax.com"),
    session: Session = Depends(get_session),
):
    tx = session.get(Transaction, tx_id)
    if tx is None:
        raise HTTPException(status_code=404, detail=f"ไม่พบรายการ id={tx_id}")

    if body is not None and body.tax_category is not None:
        tx.tax_category = body.tax_category.value
        if tx.tax_category.startswith("deduction_"):
            ded = Deduction(
                user_email=(user_email or "demo@chilltax.com").strip().lower(),
                type=tx.tax_category,
                title=tx.receiver_name or "สลิปค่าลดหย่อนภาษี",
                amount=tx.amount or 0.0,
                transaction_date=tx.transaction_date,
                note=tx.memo or tx.reasoning,
            )
            session.add(ded)

    session.add(tx)
    session.commit()
    session.refresh(tx)
    return tx


@app.put("/api/transactions/{tx_id}/revert", response_model=Transaction)
def revert_transaction_to_pending(
    tx_id: int,
    session: Session = Depends(get_session),
):
    tx = session.get(Transaction, tx_id)
    if tx is None:
        raise HTTPException(status_code=404, detail=f"ไม่พบรายการ id={tx_id}")

    tx.status = TxStatus.pending.value
    session.add(tx)
    session.commit()
    session.refresh(tx)
    return tx


# ---------------------------------------------------------------------------
# Login & Taxpayer Profile Endpoints
# ---------------------------------------------------------------------------
# ---------------------------------------------------------------------------
# Tax Deduction Calculation Engine (กฎหมายภาษีไทยล่าสุด ปี 2569)
# ---------------------------------------------------------------------------
def calculate_total_deduction(
    user_profile: User,
    scanned_receipts: List[Deduction],
    total_income: float = 0.0,
    total_expense_business: float = 0.0,
) -> dict:
    """
    คำนวณสิทธิลดหย่อนภาษีส่วนบุคคลแบบครบวงจรตามกฎหมายภาษีไทยล่าสุด (ปี 2569)
    1. สิทธิส่วนตัว & ครอบครัว:
       - ส่วนตัว: 60,000 บาท (อัตโนมัติ)
       - คู่สมรส: 60,000 บาท (ถ้า spouse_has_income == False หรือ status_type == 'married_no_income')
       - บุตร: คนแรก 30,000 บาท, คนที่ 2 ขึ้นไปเกิดปี 2561 เป็นต้นไป คนละ 60,000 บาท
       - บิดามารดา: คนละ 30,000 บาท (สูงสุด 4 คน = 120,000 บาท)
       - ประกันสังคม: จ่ายจริงสูงสุดไม่เกิน 10,500 บาท (เพดานใหม่ปี 2569)
    2. สิทธิจากการสแกนบิล/ใบเสร็จ:
       - ประกันชีวิต + สุขภาพตนเอง: สูงสุดไม่เกิน 100,000 บาท
       - Thai ESG: ไม่เกิน 30% ของเงินได้ และสูงสุดไม่เกิน 300,000 บาท
       - ติดตั้งโซลาร์เซลล์ (Solar Rooftop / On-Grid): ตามจริงสูงสุดไม่เกิน 200,000 บาท
       - Easy E-Receipt / ช้อปดีมีคืน: ตามจริงสูงสุด 50,000 บาท
       - ค่าฝากครรภ์/คลอดบุตร: สูงสุด 60,000 บาท
       - เงินบริจาค: 2 เท่าสำหรับ รพ./การศึกษา/e-Donation และ 1 เท่าสำหรับทั่วไป (รวมไม่เกิน 10% ของเงินได้หลังหักค่าใช้จ่ายและลดหย่อนอื่นๆ)
    """
    # 1. ส่วนตัว & ครอบครัว
    personal_allowance = 60000.0

    # คู่สมรส
    is_spouse_deductible = False
    if user_profile.status_type == "married_no_income":
        is_spouse_deductible = True
    elif user_profile.status_type == "married_has_income":
        is_spouse_deductible = False
    elif not getattr(user_profile, "spouse_has_income", False) and user_profile.status_type != "single":
        is_spouse_deductible = True

    spouse_allowance = 60000.0 if is_spouse_deductible else 0.0

    # บุตร
    c1 = max(0, getattr(user_profile, "child_first_count", 0))
    c2 = max(0, getattr(user_profile, "child_second_plus_count", 0))
    total_children = c1 + c2
    if total_children == 0 and getattr(user_profile, "child_count", 0) > 0:
        c1 = user_profile.child_count
        total_children = c1

    child_first_allowance = float(c1 * 30000.0)
    child_second_plus_allowance = float(c2 * 60000.0)
    child_allowance = child_first_allowance + child_second_plus_allowance

    # บิดามารดา (สูงสุด 4 ท่าน = 120,000 บาท)
    parent_count = max(0, min(4, getattr(user_profile, "disabled_parent_count", 0)))
    parent_allowance = float(parent_count * 30000.0)

    # ประกันสังคม (เพดานใหม่ปี 2569: 10,500 บาท)
    raw_ss = getattr(user_profile, "social_security", 10500.0)
    social_security_allowance = float(min(max(raw_ss, 0.0), 10500.0))

    total_personal_family = round(
        personal_allowance + spouse_allowance + child_allowance + parent_allowance + social_security_allowance, 2
    )

    # 2. รายการลดหย่อนจากสลิปที่สแกน
    category_totals = {
        "deduction_insurance": 0.0,
        "deduction_donation": 0.0,
        "deduction_thaiesg": 0.0,
        "deduction_solar": 0.0,
        "deduction_shopping": 0.0,
        "deduction_medical": 0.0,
    }

    donation_1x_total = 0.0
    donation_2x_total = 0.0
    two_x_keywords = [
        "รพ", "โรงพยาบาล", "การศึกษา", "e-donation", "edonation",
        "ศิริราช", "กาชาด", "มหาวิทยาลัย", "โรงเรียน", "บริจาค 2 เท่า"
    ]

    for d in scanned_receipts:
        cat = d.type
        amt = float(d.amount or 0.0)
        if cat in category_totals:
            category_totals[cat] += amt

        if cat == "deduction_donation":
            desc = f"{d.title or ''} {d.note or ''}".lower()
            if any(kw in desc for kw in two_x_keywords):
                donation_2x_total += amt
            else:
                donation_1x_total += amt

    # 2.1 ประกันชีวิต + สุขภาพ: สูงสุด 100,000 บาท
    effective_insurance = min(category_totals["deduction_insurance"], 100000.0)

    # 2.2 Thai ESG: ไม่เกิน 30% ของเงินได้ และสูงสุดไม่เกิน 300,000 บาท
    thaiesg_limit = 300000.0
    if total_income > 0:
        thaiesg_limit = min(300000.0, round(total_income * 0.30, 2))
    effective_thaiesg = min(category_totals["deduction_thaiesg"], thaiesg_limit)

    # 2.3 ติดตั้งโซลาร์เซลล์: สูงสุด 200,000 บาท
    effective_solar = min(category_totals["deduction_solar"], 200000.0)

    # 2.4 Easy E-Receipt: สูงสุด 50,000 บาท
    effective_shopping = min(category_totals["deduction_shopping"], 50000.0)

    # 2.5 ค่าฝากครรภ์/คลอดบุตร: สูงสุด 60,000 บาท
    effective_medical = min(category_totals["deduction_medical"], 60000.0)

    # 2.6 เงินบริจาค (2x รพ./การศึกษา, 1x ทั่วไป; เพดาน 10% ของเงินได้หลังหักค่าใช้จ่ายและลดหย่อนอื่นๆ)
    calculated_donation = (donation_1x_total * 1.0) + (donation_2x_total * 2.0)
    deductions_before_donation = (
        total_personal_family
        + effective_insurance
        + effective_thaiesg
        + effective_solar
        + effective_shopping
        + effective_medical
    )
    net_income_before_donation = max(0.0, (total_income - total_expense_business) - deductions_before_donation)

    if total_income > 0:
        donation_limit_10pct = round(net_income_before_donation * 0.10, 2)
        effective_donation = min(calculated_donation, donation_limit_10pct)
    else:
        donation_limit_10pct = calculated_donation
        effective_donation = calculated_donation

    total_scanned_deductions = round(
        effective_insurance
        + effective_thaiesg
        + effective_solar
        + effective_shopping
        + effective_medical
        + effective_donation,
        2,
    )

    grand_total_deductions = round(total_personal_family + total_scanned_deductions, 2)

    return {
        "personal_allowance": personal_allowance,
        "spouse_allowance": spouse_allowance,
        "spouse_has_income": not is_spouse_deductible,
        "child_first_count": c1,
        "child_second_plus_count": c2,
        "child_count": total_children,
        "child_first_allowance": child_first_allowance,
        "child_second_plus_allowance": child_second_plus_allowance,
        "child_allowance": child_allowance,
        "parent_allowance": parent_allowance,
        "social_security_allowance": social_security_allowance,
        "total_personal_family": total_personal_family,
        "total_scanned_deductions": total_scanned_deductions,
        "grand_total_deductions": grand_total_deductions,
        "category_totals": category_totals,
        "breakdown_details": {
            "effective_insurance": effective_insurance,
            "effective_thaiesg": effective_thaiesg,
            "thaiesg_limit": thaiesg_limit,
            "effective_solar": effective_solar,
            "effective_shopping": effective_shopping,
            "effective_medical": effective_medical,
            "donation_1x_total": donation_1x_total,
            "donation_2x_total": donation_2x_total,
            "donation_calculated": calculated_donation,
            "donation_limit_10pct": donation_limit_10pct,
            "effective_donation": effective_donation,
        },
    }


# ---------------------------------------------------------------------------
# Login & Taxpayer Profile Endpoints (ระบบเข้าสู่ระบบและสร้างบัญชี)
# ---------------------------------------------------------------------------
@app.post("/api/register", response_model=User)
def register(req: RegisterRequest, session: Session = Depends(get_session)):
    email = req.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="กรุณาระบุอีเมลที่ถูกต้อง")
    if not req.password or len(req.password.strip()) < 4:
        raise HTTPException(status_code=400, detail="รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร")

    existing = session.exec(select(User).where(User.email == email)).first()
    if existing is not None:
        raise HTTPException(status_code=400, detail="อีเมลนี้ลงทะเบียนในระบบแล้ว กรุณาเข้าสู่ระบบ")

    display_name = req.fullname.strip() if req.fullname and req.fullname.strip() else email.split("@")[0].capitalize()
    new_user = User(
        email=email,
        fullname=display_name,
        password_hash=hash_password(req.password),
        status_type="single",
        spouse_has_income=False,
        child_first_count=0,
        child_second_plus_count=0,
        child_count=0,
        disabled_parent_count=0,
        social_security=10500.0,
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    logger.info("Successfully registered new user with password: %s", email)
    return new_user


@app.post("/api/login", response_model=User)
def login(req: LoginRequest, session: Session = Depends(get_session)):
    email = req.email.strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="กรุณาระบุอีเมล")

    user = session.exec(select(User).where(User.email == email)).first()
    if user is None:
        raise HTTPException(
            status_code=404,
            detail="ไม่พบบัญชีผู้ใช้นี้ กรุณากดเลือก 'สร้างบัญชีใหม่' เพื่อลงทะเบียน",
        )

    # ตรวจสอบรหัสผ่าน (หากมี hash บันทึกไว้)
    if user.password_hash:
        if not req.password:
            raise HTTPException(status_code=400, detail="กรุณาระบุรหัสผ่านเพื่อเข้าใช้งาน")
        if not verify_password(req.password, user.password_hash):
            raise HTTPException(status_code=400, detail="รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง")
    else:
        # บัญชีดั้งเดิมที่ยังไม่มีรหัสผ่าน หากส่งรหัสผ่านเข้ามาให้บันทึกเป็นรหัสผ่านใหม่
        if req.password and req.password.strip():
            user.password_hash = hash_password(req.password)
            session.add(user)
            session.commit()
            session.refresh(user)

    return user


@app.post("/api/user/profile", response_model=User)
def update_profile(req: UserProfileUpdate, session: Session = Depends(get_session)):
    email = req.email.strip().lower()
    user = session.exec(select(User).where(User.email == email)).first()
    if user is None:
        c1 = req.child_first_count or 0
        c2 = req.child_second_plus_count or 0
        user = User(
            email=email,
            fullname=req.fullname or email.split("@")[0].capitalize(),
            status_type=req.status_type or "single",
            spouse_has_income=req.spouse_has_income or False,
            child_first_count=c1,
            child_second_plus_count=c2,
            child_count=c1 + c2,
            disabled_parent_count=req.disabled_parent_count or 0,
            social_security=req.social_security if req.social_security is not None else 10500.0,
        )
        session.add(user)
    else:
        if req.fullname is not None:
            user.fullname = req.fullname
        if req.status_type is not None:
            user.status_type = req.status_type
        if req.spouse_has_income is not None:
            user.spouse_has_income = req.spouse_has_income
        elif req.status_type == "married_no_income":
            user.spouse_has_income = False
        elif req.status_type == "married_has_income":
            user.spouse_has_income = True

        if req.child_first_count is not None:
            user.child_first_count = max(0, req.child_first_count)
        if req.child_second_plus_count is not None:
            user.child_second_plus_count = max(0, req.child_second_plus_count)
        user.child_count = user.child_first_count + user.child_second_plus_count

        if req.disabled_parent_count is not None:
            user.disabled_parent_count = max(0, min(4, req.disabled_parent_count))
        if req.social_security is not None:
            user.social_security = max(0.0, min(10500.0, float(req.social_security)))
        session.add(user)

    session.commit()
    session.refresh(user)
    return user


@app.get("/api/user/deduction-summary", response_model=DeductionSummaryResponse)
def get_deduction_summary(email: str = Query(...), session: Session = Depends(get_session)):
    email_clean = email.strip().lower()
    user = session.exec(select(User).where(User.email == email_clean)).first()
    if user is None:
        user = User(
            email=email_clean,
            fullname=email_clean.split("@")[0].capitalize(),
            status_type="single",
            spouse_has_income=False,
            child_first_count=0,
            child_second_plus_count=0,
            child_count=0,
            disabled_parent_count=0,
            social_security=10500.0,
        )
        session.add(user)
        session.commit()
        session.refresh(user)

    # ดึงยอดรายได้และรายจ่ายที่ยืนยันแล้ว
    def confirmed_sum(category: TaxCategory) -> float:
        stmt = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.status == TxStatus.confirmed.value,
            Transaction.tax_category == category.value,
        )
        return round(float(session.exec(stmt).one()), 2)

    total_income = round(
        confirmed_sum(TaxCategory.income_40_1)
        + confirmed_sum(TaxCategory.income_40_2)
        + confirmed_sum(TaxCategory.income_40_3)
        + confirmed_sum(TaxCategory.income_40_4)
        + confirmed_sum(TaxCategory.income_40_5)
        + confirmed_sum(TaxCategory.income_40_6)
        + confirmed_sum(TaxCategory.income_40_7)
        + confirmed_sum(TaxCategory.income_40_8),
        2,
    )
    total_expense_business = confirmed_sum(TaxCategory.expense_business)

    # ดึงรายการลดหย่อนจากการสแกนสลิป/ใบเสร็จ
    deductions = session.exec(
        select(Deduction).where(Deduction.user_email == email_clean).order_by(Deduction.id.desc())
    ).all()

    # เรียกใช้ฟังก์ชัน Tax Deduction Calculation Engine
    calc = calculate_total_deduction(
        user_profile=user,
        scanned_receipts=deductions,
        total_income=total_income,
        total_expense_business=total_expense_business,
    )

    return DeductionSummaryResponse(
        email=user.email,
        fullname=user.fullname or "ผู้เสียภาษี",
        status_type=user.status_type,
        spouse_has_income=calc["spouse_has_income"],
        child_first_count=calc["child_first_count"],
        child_second_plus_count=calc["child_second_plus_count"],
        child_count=calc["child_count"],
        disabled_parent_count=user.disabled_parent_count,
        social_security=user.social_security,
        personal_allowance=calc["personal_allowance"],
        spouse_allowance=calc["spouse_allowance"],
        child_first_allowance=calc["child_first_allowance"],
        child_second_plus_allowance=calc["child_second_plus_allowance"],
        child_allowance=calc["child_allowance"],
        parent_allowance=calc["parent_allowance"],
        social_security_allowance=calc["social_security_allowance"],
        total_personal_family=calc["total_personal_family"],
        total_scanned_deductions=calc["total_scanned_deductions"],
        grand_total_deductions=calc["grand_total_deductions"],
        scanned_items=deductions,
        category_totals=calc["category_totals"],
        breakdown_details=calc["breakdown_details"],
    )


# ---------------------------------------------------------------------------
# คำนวณภาษีเงินได้บุคคลธรรมดาแบบขั้นบันได (Progressive Tax Rates)
# ---------------------------------------------------------------------------
def compute_thai_progressive_tax(net_taxable_income: float) -> tuple[float, list[dict]]:
    """
    อัตราภาษีเงินได้บุคคลธรรมดาของประเทศไทย:
    0 - 150,000 : 0% (ยกเว้น)
    150,001 - 300,000 : 5%
    300,001 - 500,000 : 10%
    500,001 - 750,000 : 15%
    750,001 - 1,000,000 : 20%
    1,000,001 - 2,000,000 : 25%
    2,000,001 - 5,000,000 : 30%
    > 5,000,000 : 35%
    """
    brackets = [
        (150000, 0.0, "0 - 150,000", "0% (ยกเว้นภาษี)"),
        (150000, 0.05, "150,001 - 300,000", "5%"),
        (200000, 0.10, "300,001 - 500,000", "10%"),
        (250000, 0.15, "500,001 - 750,000", "15%"),
        (250000, 0.20, "750,001 - 1,000,000", "20%"),
        (1000000, 0.25, "1,000,001 - 2,000,000", "25%"),
        (3000000, 0.30, "2,000,001 - 5,000,000", "30%"),
        (float("inf"), 0.35, "เกิน 5,000,000", "35%"),
    ]
    rem = max(0.0, net_taxable_income)
    total_tax = 0.0
    breakdown = []
    for span, rate, label, rate_lbl in brackets:
        if rem <= 0:
            break
        taxable_in_bracket = min(rem, span)
        tax_in_bracket = round(taxable_in_bracket * rate, 2)
        total_tax += tax_in_bracket
        breakdown.append({
            "bracket": label,
            "rate": rate_lbl,
            "taxable_amount": round(taxable_in_bracket, 2),
            "tax_amount": round(tax_in_bracket, 2),
        })
        rem -= taxable_in_bracket
    return round(total_tax, 2), breakdown


@app.get("/api/dashboard-stats", response_model=DashboardStats)
def dashboard_stats(session: Session = Depends(get_session)):
    def confirmed_sum(category: TaxCategory) -> float:
        stmt = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.status == TxStatus.confirmed.value,
            Transaction.tax_category == category.value,
        )
        return round(float(session.exec(stmt).one()), 2)

    # 1. รายรับแยกตามมาตรา 40 ครบทั้ง 8 ประเภท
    income_40_1 = confirmed_sum(TaxCategory.income_40_1)
    income_40_2 = confirmed_sum(TaxCategory.income_40_2)
    income_40_3 = confirmed_sum(TaxCategory.income_40_3)
    income_40_4 = confirmed_sum(TaxCategory.income_40_4)
    income_40_5 = confirmed_sum(TaxCategory.income_40_5)
    income_40_6 = confirmed_sum(TaxCategory.income_40_6)
    income_40_7 = confirmed_sum(TaxCategory.income_40_7)
    income_40_8 = confirmed_sum(TaxCategory.income_40_8)
    total_income = round(
        income_40_1 + income_40_2 + income_40_3 + income_40_4 +
        income_40_5 + income_40_6 + income_40_7 + income_40_8,
        2
    )

    # 2. รายจ่ายธุรกิจจริง
    total_expense_business = confirmed_sum(TaxCategory.expense_business)
    net_profit = round(total_income - total_expense_business, 2)

    # 3. หักค่าใช้จ่ายตามเกณฑ์กฎหมายไทย (Section 40 ครบทั้ง 8 หมวด)
    # - 40(1) + 40(2): หักเหมา 50% สูงสุดไม่เกิน 100,000 บาท
    expense_40_1_2 = round(min((income_40_1 + income_40_2) * 0.50, 100000.0), 2)

    # - 40(3) ค่าลิขสิทธิ์ / ทรัพย์สินทางปัญญา: หักเหมา 50% สูงสุดไม่เกิน 100,000 บาท
    expense_40_3 = round(min(income_40_3 * 0.50, 100000.0), 2)

    # - 40(4) ดอกเบี้ย / เงินปันผล / คริปโต: หักค่าใช้จ่ายไม่ได้ (0%)
    expense_40_4 = 0.0

    # - 40(5) ค่าเช่าทรัพย์สิน: หักเหมา 30%
    expense_40_5 = round(income_40_5 * 0.30, 2)

    # - 40(6) วิชาชีพอิสระ (แพทย์, ทนาย, วิศวะ ฯลฯ): หักเหมา 30% (หรือตามจริง)
    expense_40_6 = round(income_40_6 * 0.30, 2)

    # - 40(7) รับเหมาก่อสร้าง (จัดหาสัมภาระ): หักเหมา 60%
    expense_40_7 = round(income_40_7 * 0.60, 2)

    # - 40(8) ธุรกิจ / ขายสินค้า: หักเหมา 60% หรือหักตามจริงจากสลิป expense_business (เลือกอันที่เยอะกว่าให้อัตโนมัติ)
    expense_40_8_flat = round(income_40_8 * 0.60, 2)
    if expense_40_8_flat >= total_expense_business:
        expense_40_8_deductible = expense_40_8_flat
        expense_40_8_choice = "flat_60pct"
    else:
        expense_40_8_deductible = total_expense_business
        expense_40_8_choice = "actual"

    total_expense_deductible = round(
        expense_40_1_2 + expense_40_3 + expense_40_4 + expense_40_5 +
        expense_40_6 + expense_40_7 + expense_40_8_deductible,
        2
    )
    income_after_expenses = max(0.0, round(total_income - total_expense_deductible, 2))

    # 4. หักค่าลดหย่อน (Tax Deductions)
    demo_user = session.exec(select(User).where(User.email == "demo@chilltax.com")).first()
    if demo_user is None:
        demo_user = session.exec(select(User).limit(1)).first()

    scanned_deds = (
        session.exec(select(Deduction).where(Deduction.user_email == demo_user.email)).all()
        if demo_user else []
    )
    if demo_user:
        calc = calculate_total_deduction(
            user_profile=demo_user,
            scanned_receipts=scanned_deds,
            total_income=total_income,
            total_expense_business=total_expense_deductible,
        )
        grand_total_deductions = calc["grand_total_deductions"]
    else:
        grand_total_deductions = 60000.0

    # 5. เงินได้สุทธิ (Net Taxable Income)
    # สูตร: (รายได้รวม - ค่าใช้จ่าย - ค่าลดหย่อนรวมทั้งหมด) = เงินได้สุทธิ
    net_taxable_income = max(0.0, round(total_income - total_expense_deductible - grand_total_deductions, 2))

    # 6. คำนวณภาษีเงินได้บุคคลธรรมดา
    # หากเงินได้สุทธิเกิน 150,000 บาท ให้นำส่วนที่เกินมาคูณอัตราภาษี 5% (สำหรับ Demo)
    if net_taxable_income > 150_000:
        estimated_income_tax = round((net_taxable_income - 150_000) * 0.05, 2)
    else:
        estimated_income_tax = 0.0

    tax_brackets_detail = [
        {
            "bracket": "0 - 150,000",
            "rate": "0% (ยกเว้น)",
            "taxable_amount": min(net_taxable_income, 150000.0),
            "tax": 0.0,
        }
    ]
    if net_taxable_income > 150000.0:
        tax_brackets_detail.append({
            "bracket": "ส่วนที่เกิน 150,000",
            "rate": "5% (อัตรา Demo)",
            "taxable_amount": round(net_taxable_income - 150000.0, 2),
            "tax": estimated_income_tax,
        })

    # 6.2 คำนวณฐานภาษีปัจจุบันและขั้นถัดไป (Tax Bracket Warning สำหรับ Demo)
    # 0 - 150,000 : ฐาน 0% (ยกเว้น)
    # 150,001 - 300,000 : ฐาน 5%
    # 300,001 - 500,000 : ฐาน 10%
    if net_taxable_income <= 150_000:
        current_bracket = 0
        current_bracket_label = "0% (ยกเว้น)"
        next_bracket = 5
        next_bracket_label = "5%"
        amount_to_next_bracket = round(150_000 - net_taxable_income, 2)
        bracket_progress_percent = round((net_taxable_income / 150_000) * 100, 1)
        bracket_nudge_text = f"💡 เงินได้สุทธิอีก ฿{amount_to_next_bracket:,.0f} จะขยับไปฐาน 5% (ปัจจุบันยังอยู่ในเกณฑ์ยกเว้น)"
    elif net_taxable_income <= 300_000:
        current_bracket = 5
        current_bracket_label = "5%"
        next_bracket = 10
        next_bracket_label = "10%"
        amount_to_next_bracket = round(300_000 - net_taxable_income, 2)
        bracket_progress_percent = round(((net_taxable_income - 150_000) / 150_000) * 100, 1)
        bracket_nudge_text = f"💡 กำไรอีก ฿{amount_to_next_bracket:,.0f} จะขยับไปเสียภาษีฐาน 10% แนะนำให้หาค่าลดหย่อนเพิ่ม"
    elif net_taxable_income <= 500_000:
        current_bracket = 10
        current_bracket_label = "10%"
        next_bracket = 15
        next_bracket_label = "15%"
        amount_to_next_bracket = round(500_000 - net_taxable_income, 2)
        bracket_progress_percent = round(((net_taxable_income - 300_000) / 200_000) * 100, 1)
        bracket_nudge_text = f"💡 กำไรอีก ฿{amount_to_next_bracket:,.0f} จะขยับไปเสียภาษีฐาน 15% แนะนำให้หาค่าลดหย่อนเพิ่ม"
    else:
        current_bracket = 15
        current_bracket_label = "15%+"
        next_bracket = 20
        next_bracket_label = "20%"
        amount_to_next_bracket = round(max(0.0, 750_000 - net_taxable_income), 2)
        bracket_progress_percent = round(min(100.0, ((net_taxable_income - 500_000) / 250_000) * 100), 1)
        bracket_nudge_text = f"💡 ฐานภาษีสูง (15%+) แนะนำกระจายรายได้หรือใช้สิทธิลดหย่อนเต็มเพดาน"

    # 7. ลอจิกคำนวณ VAT 7%
    # เงื่อนไข: if total_income < 1800000: ให้ค่า estimated_vat = 0 และตั้งข้อความใน UI ว่า 'ยังไม่ถึงเกณฑ์จด VAT' แต่ถ้าเกิน 1.8 ล้าน ถึงจะใช้สูตรคำนวณหักลบภาษีซื้อ
    if total_income < VAT_THRESHOLD:
        estimated_vat = 0.0
        vat_status_label = "ยังไม่ถึงเกณฑ์จด VAT"
    else:
        # เกิน 1.8 ล้าน ใช้สูตรคำนวณหักลบภาษีซื้อ: ภาษีขาย (7% ของยอดขาย) - ภาษีซื้อ (7% ของรายจ่ายธุรกิจ)
        vat_sales = (income_40_8 if income_40_8 > 0 else total_income) * 0.07
        vat_purchase = total_expense_business * 0.07
        vat_diff = vat_sales - vat_purchase
        estimated_vat = round(max(0.0, vat_diff), 2)
        vat_status_label = "ถึงเกณฑ์จด VAT (คำนวณหักลบภาษีซื้อ)"

    # 8. Pending Count
    pending_count = session.exec(
        select(func.count()).select_from(Transaction).where(Transaction.status == TxStatus.pending.value)
    ).one()

    # 9. วันครบกำหนดภาษี
    now = datetime.now()
    if now.month == 12:
        next_month = 1
        next_year = now.year + 1
    else:
        next_month = now.month + 1
        next_year = now.year

    thai_months = [
        "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
        "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ]
    vat_due_date = f"15 {thai_months[next_month - 1]} {next_year}"

    if 7 <= now.month <= 9:
        income_tax_due_date = f"ยื่น ภ.ง.ด.94 ครึ่งปี ภายใน 30 ก.ย. {now.year}"
    else:
        target_year = now.year if now.month <= 3 else now.year + 1
        income_tax_due_date = f"ยื่น ภ.ง.ด.90 ภายใน 31 มี.ค. {target_year}"

    return DashboardStats(
        income_40_1=income_40_1,
        income_40_2=income_40_2,
        income_40_3=income_40_3,
        income_40_4=income_40_4,
        income_40_5=income_40_5,
        income_40_6=income_40_6,
        income_40_7=income_40_7,
        income_40_8=income_40_8,
        total_income=total_income,
        total_expense_business=total_expense_business,
        net_profit=net_profit,
        expense_40_1_2=expense_40_1_2,
        expense_40_3=expense_40_3,
        expense_40_4=expense_40_4,
        expense_40_5=expense_40_5,
        expense_40_6=expense_40_6,
        expense_40_7=expense_40_7,
        expense_40_8_deductible=expense_40_8_deductible,
        expense_40_8_choice=expense_40_8_choice,
        expense_40_8_flat=expense_40_8_flat,
        total_expense_deductible=total_expense_deductible,
        income_after_expenses=income_after_expenses,
        grand_total_deductions=grand_total_deductions,
        net_taxable_income=net_taxable_income,
        estimated_income_tax=estimated_income_tax,
        tax_brackets_detail=tax_brackets_detail,
        current_bracket=current_bracket,
        current_bracket_label=current_bracket_label,
        next_bracket=next_bracket,
        next_bracket_label=next_bracket_label,
        amount_to_next_bracket=amount_to_next_bracket,
        bracket_progress_percent=bracket_progress_percent,
        bracket_nudge_text=bracket_nudge_text,
        estimated_vat=estimated_vat,
        vat_status_label=vat_status_label,
        vat_due_date=vat_due_date,
        income_tax_due_date=income_tax_due_date,
        pending_count=pending_count,
        vat_threshold=VAT_THRESHOLD,
        vat_progress_percent=round(income_40_8 / VAT_THRESHOLD * 100, 2),
    )


# ---------------------------------------------------------------------------
# Serve Frontend Build (dist) & APK Download for Single-URL Judge Demo
# ---------------------------------------------------------------------------
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

FRONTEND_DIST = (
    BASE_DIR / "dist"
    if (BASE_DIR / "dist" / "index.html").exists()
    else BASE_DIR.parent / "chilltax-app" / "dist"
)
APK_FILE_PATH = (
    BASE_DIR / "ChillTax.apk"
    if (BASE_DIR / "ChillTax.apk").exists()
    else BASE_DIR.parent / "ChillTax.apk"
)


@app.get("/download/ChillTax.apk")
def download_apk():
    if APK_FILE_PATH.exists():
        return FileResponse(
            path=str(APK_FILE_PATH),
            filename="ChillTax.apk",
            media_type="application/vnd.android.package-archive",
        )
    raise HTTPException(status_code=404, detail="APK file not found")


if (FRONTEND_DIST / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")


@app.get("/")
def serve_spa_index():
    index_file = FRONTEND_DIST / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return {"status": "ok", "message": "ChillTax API is running"}


if __name__ == "__main__":
    import uvicorn

    # host="0.0.0.0" เพื่อให้อุปกรณ์อื่นในเครือข่ายเดียวกัน (เช่น มือถือ) เชื่อมต่อเข้ามาได้
    # ส่ง app object ตรงๆ (ไม่ใช้ "main:app") เพื่อไม่ให้ไฟล์นี้ถูก import ซ้ำ -> ตาราง DB ถูกนิยามซ้ำ
    # ถ้าต้องการ auto-reload ตอนแก้โค้ด ให้รัน: uvicorn main:app --reload --host 0.0.0.0 --port 8000
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
    )

