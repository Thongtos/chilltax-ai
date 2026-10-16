# 🇹🇭 ChillTax — AI Personal Tax & Slip OCR Assistant (ระบบผู้ช่วยวางแผนภาษีและวิเคราะห์สลิปอัจฉริยะ)

**ChillTax** คือแพลตฟอร์ม AI FinTech สำหรับฟรีแลนซ์ พ่อค้าแม่ค้าออนไลน์ และผู้เสียภาษีบุคคลธรรมดาภายใต้ **ประมวลรัษฎากรไทย (Thai Revenue Code)** ขับเคลื่อนด้วย **Google Gemini Vision AI** และ **FastAPI + React (Capacitor Mobile App)**

---

## ✨ ฟีเจอร์หลัก (Key Features)

1. **⚡ Zero Data Entry — AI Slip & Receipt OCR (`Gemini Vision`)**
   - สแกนสลิปโอนเงินธนาคาร (K PLUS, SCB EASY, Krungthai NEXT, Bangkok Bank, ttb touch, TrueMoney) และใบเสร็จรับเงินอัตโนมัติ
   - สกัดชื่อผู้โอน/ผู้รับ ยอดเงิน วันที่ และ **บันทึกช่วยจำ (Memo)** เพื่อจำแนกหมวดหมู่ภาษีอัตโนมัติ พร้อมแจ้งเตือนความเสี่ยงเมื่อลืมระบุ Memo (Behavioral Nudging)
2. **📊 แยกประเภทเงินได้พึงประเมิน มาตรา 40(1) – 40(8) ครบทั้ง 8 ประเภท**
   - คำนวณการหักค่าใช้จ่ายตามกฎหมายอัตโนมัติ และเปรียบเทียบ **หักเหมา 60% vs หักตามจริง (จากบิลรายจ่ายธุรกิจ)** สำหรับมาตรา 40(8) เพื่อเลือกวิธีที่ประหยัดภาษีที่สุดให้อัตโนมัติ
3. **🚨 ระบบเตือนการขยับฐานภาษี (Tax Bracket Warning & Nudge) & VAT 1.8M Guard**
   - คำนวณเงินได้สุทธิ (Net Taxable Income) และแสดงหลอด Progress Bar แจ้งเตือนฐานภาษีปัจจุบัน (`0%`, `5%`, `10%`, `15%+`) พร้อมคำนวณยอดกำไรคงเหลือก่อนขยับสู่ฐานภาษีขั้นถัดไปแบบ Real-time
   - ติดตามเพดานรายรับ **1,800,000 บาท/ปี** เพื่อแจ้งเตือนก่อนถึงเกณฑ์จดทะเบียนภาษีมูลค่าเพิ่ม (VAT 7%)
4. **🛡️ แฟ้มชี้แจงสรรพากรอัตโนมัติ (AI Tax Audit Defense Dossier)**
   - สร้างรายงานสรุปภาษีทางการ (ภ.ง.ด.90 / ภ.พ.30) พร้อมตารางบัญชีหลักฐานสลิปแนบและเหตุผลประกอบทางภาษีที่รับรองโดย AI
5. **🌐 รองรับ 2 ภาษา (Bilingual TH / EN) + ป้ายกำกับเขตอำนาจภาษี (`🇹🇭 Thai Tax System`)**
   - สลับภาษาไทย/อังกฤษได้ทันทีแบบ Real-time พร้อม Onboarding Welcome Tour 3 ขั้นตอนสำหรับผู้ใช้งานใหม่

---

## 🏗️ โครงสร้างโปรเจกต์ (Project Structure)

- `main.py` — ระบบ Backend API (**FastAPI + SQLModel/SQLite + Google GenAI SDK**) พร้อมเสิร์ฟ Production Frontend (`dist/`) ในพอร์ตเดียวกัน
- `src/App.jsx` — โค้ดต้นฉบับฝั่ง Frontend (**React + Tailwind CSS + Lucide Icons**)
- `dist/` — ไฟล์ Production Build ของเว็บแอปพลิเคชันสำหรับรันบน Cloud ทันที
- `Dockerfile` & `render.yaml` — ไฟล์ตั้งค่าสำหรับ Deploy ขึ้น Cloud (Render.com / Hugging Face Spaces / Railway)

---

## 🚀 วิธีรันโปรเจกต์ (Quick Start)

### 1. ตั้งค่า Environment Variable
```bash
export GEMINI_API_KEY="your_gemini_api_key"
export GEMINI_MODEL="gemini-3.1-flash-lite"
```

### 2. ติดตั้งไลบรารีและรันเซิร์ฟเวอร์
```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```
เปิดเบราว์เซอร์ที่ `http://localhost:8000`
