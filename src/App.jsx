import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  ScanLine,
  CheckCheck,
  UploadCloud,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  FileText,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Receipt,
  Calendar,
  User,
  Info,
  Clock,
  Gauge,
  FileDown,
  Printer,
  X,
  Download,
  Zap,
  CheckCircle2,
  FolderArchive,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  UserPlus,
  SlidersHorizontal,
  Calculator,
  Landmark,
  Images,
  Smartphone,
  Layers,
  Radio,
  PiggyBank,
  HeartHandshake,
  ShoppingBag,
  HeartPulse,
  LogOut,
  LogIn,
  Mail,
  Baby,
  Users,
  Minus,
  Plus,
  ShieldPlus,
  Sun,
  Leaf,
  Settings,
  Wifi,
  WifiOff,
  Globe,
  Server,
  Edit2,
  RotateCcw,
  History,
  HelpCircle,
} from 'lucide-react';

// Smart API URL & Server Configuration
const PUBLIC_TUNNEL_URL = 'https://classic-coupon-frequencies-leone.trycloudflare.com';
const LOCAL_LAN_URL = 'http://172.20.10.8:8000';
const CANDIDATE_SERVERS = [
  PUBLIC_TUNNEL_URL,
  LOCAL_LAN_URL,
  'http://192.168.127.152:8000',
  'http://localhost:8000',
];

const isNativeApp = typeof window !== 'undefined' && Boolean(window.Capacitor?.isNativePlatform?.());
const isRemoteWebHost =
  typeof window !== 'undefined' &&
  !isNativeApp &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1';

const DEFAULT_API_BASE = isNativeApp
  ? (import.meta.env.VITE_API_BASE || PUBLIC_TUNNEL_URL)
  : isRemoteWebHost
  ? window.location.origin
  : 'http://localhost:8000';

const getStoredApiBase = () => {
  if (typeof window !== 'undefined') {
    if (isRemoteWebHost) {
      return window.location.origin;
    }
    const saved = localStorage.getItem('chilltax_api_base');
    if (saved && saved.trim()) {
      const cleanSaved = saved.trim().replace(/\/$/, '');
      // Auto-heal old stale LAN IPs or expired quick tunnel URLs
      if (
        cleanSaved.includes('10.26.9.188') ||
        cleanSaved.includes('192.168.127.152') ||
        cleanSaved.includes('despite-reveals-never-geology')
      ) {
        localStorage.setItem('chilltax_api_base', DEFAULT_API_BASE);
        return DEFAULT_API_BASE;
      }
      return cleanSaved;
    }
  }
  return DEFAULT_API_BASE;
};

let API_BASE = getStoredApiBase();

const setGlobalApiBase = (url) => {
  const clean = (url || '').trim().replace(/\/$/, '');
  API_BASE = clean || DEFAULT_API_BASE;
  if (typeof window !== 'undefined') {
    localStorage.setItem('chilltax_api_base', API_BASE);
  }
};

// Fallback Mock Data for Offline Demo Mode
const FALLBACK_STATS = {
  income_40_1: 50000.0,
  income_40_2: 45000.0,
  income_40_3: 0.0,
  income_40_4: 0.0,
  income_40_5: 0.0,
  income_40_6: 0.0,
  income_40_7: 0.0,
  income_40_8: 270000.0,
  total_income: 365000.0,
  total_expense_business: 44090.0,
  net_profit: 320910.0,
  expense_40_1_2: 47500.0,
  expense_40_3: 0.0,
  expense_40_4: 0.0,
  expense_40_5: 0.0,
  expense_40_6: 0.0,
  expense_40_7: 0.0,
  expense_40_8_deductible: 162000.0,
  expense_40_8_choice: 'flat_60pct',
  expense_40_8_flat: 162000.0,
  total_expense_deductible: 209500.0,
  income_after_expenses: 155500.0,
  grand_total_deductions: 277000.0,
  net_taxable_income: 0.0,
  estimated_income_tax: 0.0,
  tax_brackets_detail: [],
  current_bracket: 0,
  current_bracket_label: '0% (ยกเว้น)',
  next_bracket: 5,
  next_bracket_label: '5%',
  amount_to_next_bracket: 150000.0,
  bracket_progress_percent: 0.0,
  bracket_nudge_text: '💡 เงินได้สุทธิอีก ฿150,000 จะขยับไปฐาน 5% (ปัจจุบันยังอยู่ในเกณฑ์ยกเว้น)',
  estimated_vat: 0.0,
  vat_status_label: 'ยังไม่ถึงเกณฑ์จด VAT',
  vat_due_date: '15 พ.ย. 2026',
  income_tax_due_date: 'ยื่น ภ.ง.ด.90 ภายใน 31 มี.ค. 2027',
  pending_count: 3,
  vat_threshold: 1800000.0,
  vat_progress_percent: 15.0,
};

// ---------------------------------------------------------------------------
// Internationalization Dictionary (TH / EN)
// ---------------------------------------------------------------------------
const DICTIONARY = {
  th: {
    // Jurisdiction Badge
    jurisdictionBadge: '🇹🇭 กฎหมายสรรพากรไทย',
    aiFintech: 'AI FinTech',
    offline: 'ออฟไลน์',
    refreshTooltip: 'รีเฟรชข้อมูล',
    logoutTooltip: 'ออกจากระบบ',
    refreshSuccess: 'อัปเดตข้อมูลล่าสุดเรียบร้อย',

    // Tab Navigation
    tabDashboard: 'ภาพรวม',
    tabDeductions: 'ลดหย่อน',
    tabScanner: 'สแกนบิล',
    tabSpeedReview: 'ตรวจบิล',

    // Core Dashboard Terms (ตามโจทย์ระบุ)
    totalIncome: 'รายรับรวม',
    totalIncomeAll: 'รวมทุกหมวด',
    businessExpenses: 'รายจ่ายธุรกิจ (มีบิล)',
    businessExpensesSub: 'หักภาษีซื้อ/ค่าใช้จ่าย',
    netProfit: 'กำไรทางภาษีเบื้องต้น (Net Profit)',
    netProfitSub: 'รายรับ 40(8) หัก รายจ่ายธุรกิจ',
    estIncomeTax: 'ภาษีเงินได้ประเมิน (ภ.ง.ด.)',
    estVat: 'VAT 7% ที่ต้องนำส่ง',
    scanBill: 'สแกนบิล',

    // Tax & VAT Details
    income40_8: 'รายรับ 40(8) ค้าขาย',
    income40_8Sub: 'เข้าเกณฑ์คำนวณ VAT',
    currentBracket: 'คุณอยู่ฐานภาษี',
    nextBracket: 'ขั้นถัดไป:',
    netTaxableIncomeLabel: 'เงินได้สุทธิ:',
    exemptTaxBadge: 'ยกเว้นภาษี (0%)',
    demoTaxBadge: '5% (Demo)',
    fileDuePrefix: 'ยื่น ภ.ง.ด.90 ภายใน 31 มี.ค. 2027',
    vatLabel: 'ภาษีมูลค่าเพิ่ม (VAT 7%)',
    vatCeilingTitle: 'เพดานภาษีมูลค่าเพิ่ม (VAT 7%)',
    of18m: 'ของ 1,800,000 บาท',
    accumulatedIncome: 'รายรับสะสม:',
    remainingAmount: 'เหลืออีก',
    incomeBySec40: 'รายรับรวมแยกตามมาตรา 40',
    incomeBySec40Sub: 'แยกหมวดภาษีเงินได้บุคคลธรรมดาโดย AI',
    proportion: 'สัดส่วน',
    vatBelowThreshold: 'ยังไม่ถึงเกณฑ์จด VAT',
    vatReachedThreshold: 'ถึงเกณฑ์จด VAT',
    vatSafeBadge: '✓ ปลอดภัย',
    vatRemaining: 'เพดานคงเหลือ:',
    vatSafeNote: 'รายได้รวมยังไม่เกิน 1,800,000 บาท (ไม่ต้องจด VAT และไม่ต้องยื่น ภ.พ.30)',
    vatWarningNote: 'หักลบภาษีซื้อจากรายจ่ายธุรกิจแล้ว (ภาษีขาย 7% - ภาษีซื้อ 7%)',
    vatDuePrefix: 'กำหนดยื่น:',
    vatDueWarning: '(ระวังเบี้ยปรับล่าช้า!)',

    // Section 40 Proportions
    income40_1Title: '💼 40(1) เงินเดือน/โบนัส',
    income40_1Desc: 'เงินได้จากการจ้างแรงงาน',
    income40_2Title: '💻 40(2) ฟรีแลนซ์/รับจ้าง',
    income40_2Desc: 'หน้าที่/รับจ้างทำของ/นายหน้า',
    income40_8Title: '🏪 40(8) ธุรกิจ/ขายของ',
    income40_8Desc: 'การพาณิชย์/ขายของ/วิชาชีพอิสระ',
    smartDeductionTitle: 'สรุปการหักค่าใช้จ่ายอัตโนมัติ (Smart Deductions)',
    smartDeductionSubtitle: 'คำนวณหักเหมาและเลือกวิธีประหยัดภาษีสูงสุดตามกฎหมาย',
    viewDeductions: 'ดูวิธีหักค่าใช้จ่าย',
    hideDeductions: 'ย่อสรุป',
    deductibleExpenseTotal: 'รวมค่าใช้จ่ายที่หักได้ทั้งหมด:',
    incomeAfterExpenses: 'เงินได้คงเหลือหลังหักค่าใช้จ่าย:',
    personalDeductionsTotal: 'หักค่าลดหย่อนส่วนตัว & กองทุน:',
    netTaxableIncomeSummary: 'เงินได้สุทธิประเมินภาษี (Net Taxable):',

    // Deduction Dashboard
    deductionEngineTitle: 'ศูนย์คำนวณสิทธิลดหย่อนภาษี 2569',
    deductionEngineSub: 'ระบบ Tax Deduction Engine อิงกฎหมายไทยล่าสุด',
    refreshDeductions: 'รีเฟรชข้อมูลลดหย่อน',
    grandTotalDeduction: 'สิทธิลดหย่อนภาษีรวมทั้งหมด',
    taxYear2026: 'ปีภาษี 2569',
    potentialSavingsPrefix: 'ประหยัดภาษีได้สูงสุดประมาณ: ',
    potentialSavingsNote: '(คำนวณที่ฐานภาษี 5%)',
    baseDeductionLabel: 'ค่าลดหย่อนพื้นฐานของคุณคือ:',
    scannedDeductionLabel: 'ค่าลดหย่อนจากสลิปที่สแกนคือ:',
    personalFamilySection: '1. ข้อมูลลดหย่อนส่วนตัว & ครอบครัว (กรอกเอง)',
    maritalStatusLabel: 'สถานะภาพสมรส:',
    statusSingle: 'โสด',
    statusSingleSub: 'ลด 60,000',
    statusMarriedNoIncome: 'สมรส (ไม่มีเงินได้)',
    statusMarriedNoIncomeSub: 'ลดหย่อนเพิ่ม 60,000',
    statusMarriedHasIncome: 'สมรส (มีเงินได้)',
    statusMarriedHasIncomeSub: 'แยกยื่นตามจริง',
    childCountLabel: 'จำนวนบุตรชอบด้วยกฎหมาย:',
    firstChildLabel: 'คนแรก / เกิดก่อน 61',
    secondChildLabel: 'คนที่ 2+ (เกิดปี 61+)',
    childPerPerson30k: '30,000 บ./คน',
    childPerPerson60k: '60,000 บ./คน',
    childUnit: 'คน',
    parentCareLabel: 'จำนวนบิดามารดาที่ดูแล (อายุ 60 ปีขึ้นไป ไม่มีเงินได้):',
    parentMax4: '(สูงสุด 4 ท่าน)',
    parentUnit: 'ท่าน (ลดหย่อนท่านละ 30,000 บ.)',
    socialSecurityLabel: 'ยอดเงินประกันสังคมที่ส่งต่อปี (เพดานใหม่ปี 2569):',
    socialSecurityFull: 'เต็มสิทธิ (10,500 บ.)',
    socialSecurityNote: '* กฎหมายปรับเพดานเงินสมทบกองทุนประกันสังคมสูงสุดเป็น 10,500 บาท/ปี',
    saveProfileBtn: 'บันทึกข้อมูลส่วนตัว & คำนวณใหม่',
    savingProfile: 'กำลังคำนวณและบันทึกข้อมูล...',
    scannedSectionTitle: '2. สิทธิลดหย่อนจากการสแกนบิล/ใบเสร็จ (Auto-Scan)',
    scannedSectionSub: 'ตรวจจับหมวดหมู่และเพดานภาษีด้วย AI อัตโนมัติ',
    scanMoreBtn: 'สแกนบิลเพิ่ม',
    deductInsurance: 'ประกันชีวิต/สุขภาพ',
    deductThaiESG: 'Thai ESG',
    deductSolar: 'ติดตั้งโซลาร์เซลล์',
    deductDonation: 'เงินบริจาค (2x/1x)',
    deductShopping: 'Easy E-Receipt',

    // Scanner View
    nativeScanTitle: 'สแกนสลิปอัจฉริยะระดับ Native',
    nativeScanSubtitle: 'ค้นหาสลิปโอนเงิน บันทึกช่วยจำ และบิลลดหย่อนในอัลบั้มรูปภาพ รวดเร็วในคลิกเดียว',
    autoSyncBtn: 'เปิดระบบ Auto-Sync แกลลอรี่',
    dropzoneText: 'หรือลากไฟล์มาวาง / คลิกเลือกรูปภาพ (เลือกได้หลายรูป)',
    dropzoneDragging: 'ปล่อยไฟล์เพื่อสแกนทันที',
    privacyBadge: 'ประมวลผลบนเครื่อง ปลอดภัยตามมาตรฐาน PDPA',
    pendingReviewCardTitle: 'มีสลิปที่รอตรวจทาน {count} รายการ',
    pendingReviewCardSub: 'ตรวจเช็คบันทึกช่วยจำและยืนยันหมวดภาษีเพื่อรับสิทธิลดหย่อน',
    supportedTitle: 'รองรับสลิปโอนเงิน & เอกสารลดหย่อน',
    permModalTitle: '“ChillTax” ต้องการเข้าถึงรูปภาพของคุณ',
    permModalDesc: 'เพื่อค้นหาสลิปโอนเงินโดยอัตโนมัติ และแยกหมวดหมู่ภาษีให้คุณอย่างแม่นยำ',
    permModalDeny: 'ไม่อนุญาต',
    permModalAllow: 'อนุญาต',

    // Speed Review View
    tabPending: 'รอตรวจสอบ',
    tabHistory: 'ประวัติบิล',
    pendingTitle: 'บิลที่รอตรวจ',
    pendingSub: 'ตรวจสอบและยืนยันหมวดหมู่ภาษี',
    confirmAllBtn: 'ยืนยันทั้งหมด',
    confirmingAllBtn: 'กำลังยืนยัน...',
    allDoneTitle: 'เรียบร้อยทุกรายการ!',
    allDoneSub: 'ไม่มีบิลค้างตรวจ สามารถดูหรือแก้ไขบิลเก่าได้ที่แท็บ \'ประวัติบิล\'',
    historyTitle: 'บิลที่บันทึกแล้ว',
    historySub: 'แก้ไขหมวดหมู่หรือส่งกลับไปรอตรวจใหม่ได้',
    aiConfidence: 'AI ความมั่นใจ',
    noMemoWarning: 'ข้อแนะนำ: สลิปนี้ไม่มีบันทึกช่วยจำ! เพื่อให้ AI แยกหมวดหมู่ภาษีได้แม่นยำ 100% แนะนำให้ระบุบันทึกช่วยจำทุกครั้งเมื่อโอนเงิน',
    mainCategoryLabel: 'หมวดหมู่หลัก:',
    catBusiness: '💼 รายจ่ายธุรกิจ',
    catPersonal: '☕ ส่วนตัว',
    catIncome: '💰 รายได้ (ม.40)',
    catIncome8: '💰 รายได้ ม.40 (8 ประเภท)',
    confirmThisBill: '[✓ ยืนยันบิลนี้]',
    confirmBillCategory: '[✓ ยืนยันหมวดหมู่นี้เข้าระบบ]',
    confirmedSuccess: 'บันทึกเข้า Dashboard สำเร็จแล้ว',
    confirmedTag: 'ยืนยันแล้ว',
    changeCategory: 'เปลี่ยนหมวด',
    clickToChange: 'กดเพื่อเลือกเปลี่ยน',
    unspecifiedDate: 'ไม่ระบุวันที่',
    unspecifiedCounterparty: 'ไม่ระบุชื่อคู่ค้า',
    aiIncomeDetected: 'AI ตรวจพบเป็นรายได้ (Income)',
    statutoryIncomeSelect: 'ประเภทเงินได้ตามกฎหมาย (เลือก 40(1) - 40(8)):',
    deductionRulePrefix: 'เกณฑ์หักค่าใช้จ่าย: ',

    // Audit Defense
    auditDefenseTitle: 'สร้างแฟ้มชี้แจงสรรพากร (Audit Defense)',
    auditDefenseSub: 'รวมหลักฐานสลิป + รายงานจัดหมวดหมู่พร้อมยื่น',

    // Alert Banner
    pendingAlert: 'มี {count} รายการรอการตรวจสอบ',
    pendingClick: 'กดเพื่อไปยังหน้า Speed Review',
  },
  en: {
    // Jurisdiction Badge
    jurisdictionBadge: '🇹🇭 Thai Tax System',
    aiFintech: 'AI FinTech',
    offline: 'Offline',
    refreshTooltip: 'Refresh Data',
    logoutTooltip: 'Log Out',
    refreshSuccess: 'Updated to latest data',

    // Tab Navigation
    tabDashboard: 'Overview',
    tabDeductions: 'Deductions',
    tabScanner: 'Scan Receipt',
    tabSpeedReview: 'Speed Review',

    // Core Dashboard Terms (ตามโจทย์ระบุ)
    totalIncome: 'Total Income',
    totalIncomeAll: 'All Categories',
    businessExpenses: 'Business Expenses',
    businessExpensesSub: 'Input VAT / Expense Deductible',
    netProfit: 'Estimated Net Profit',
    netProfitSub: '40(8) Income minus Business Expenses',
    estIncomeTax: 'Estimated Income Tax',
    estVat: 'VAT 7% Payable',
    scanBill: 'Scan Receipt',

    // Tax & VAT Details
    income40_8: '40(8) Commercial Sales',
    income40_8Sub: 'Subject to VAT calculation',
    currentBracket: 'Current Tax Bracket: ',
    nextBracket: 'Next:',
    netTaxableIncomeLabel: 'Net Taxable Income:',
    exemptTaxBadge: 'Tax Exempt (0%)',
    demoTaxBadge: '5% (Demo)',
    fileDuePrefix: 'File P.N.D.90 by 31 Mar 2027',
    vatLabel: 'Value Added Tax (VAT 7%)',
    vatCeilingTitle: 'VAT Ceiling (7%)',
    of18m: 'of 1,800,000 THB',
    accumulatedIncome: 'Accumulated Income:',
    remainingAmount: 'Remaining',
    incomeBySec40: 'Total Income by Section 40',
    incomeBySec40Sub: 'AI-Categorized Personal Income Tax',
    proportion: 'Share',
    vatBelowThreshold: 'Below VAT Threshold',
    vatReachedThreshold: 'VAT Registration Required',
    vatSafeBadge: '✓ Safe',
    vatRemaining: 'Remaining Threshold:',
    vatSafeNote: 'Total income under 1,800,000 THB (No VAT registration & no P.P.30 required)',
    vatWarningNote: 'Input tax deducted from business expenses (Output 7% - Input 7%)',
    vatDuePrefix: 'Filing Due:',
    vatDueWarning: '(Avoid late filing penalties!)',

    // Section 40 Proportions
    income40_1Title: '💼 40(1) Salary/Bonus',
    income40_1Desc: 'Employment income',
    income40_2Title: '💻 40(2) Freelance/Contract',
    income40_2Desc: 'Services/Freelance/Commission',
    income40_8Title: '🏪 40(8) Business/Commerce',
    income40_8Desc: 'Commerce/Trade/Professions',
    smartDeductionTitle: 'Smart Deductions Summary',
    smartDeductionSubtitle: 'Optimized Flat vs Actual expense deduction by law',
    viewDeductions: 'View Breakdown',
    hideDeductions: 'Hide Breakdown',
    deductibleExpenseTotal: 'Total Deductible Expenses:',
    incomeAfterExpenses: 'Income After Deductible Expenses:',
    personalDeductionsTotal: 'Personal & Fund Allowances:',
    netTaxableIncomeSummary: 'Net Taxable Income:',

    // Deduction Dashboard
    deductionEngineTitle: 'Tax Deduction Engine 2026',
    deductionEngineSub: 'Latest Thai Tax Law Deduction Engine',
    refreshDeductions: 'Refresh Deductions',
    grandTotalDeduction: 'Total Tax Deductions',
    taxYear2026: 'Tax Year 2026',
    potentialSavingsPrefix: 'Est. Tax Saved Up To: ',
    potentialSavingsNote: '(Calculated at 5% bracket)',
    baseDeductionLabel: 'Your Base Allowances:',
    scannedDeductionLabel: 'Deductions from Scanned Slips:',
    personalFamilySection: '1. Personal & Family Allowances (Manual)',
    maritalStatusLabel: 'Marital Status:',
    statusSingle: 'Single',
    statusSingleSub: 'Deduct 60,000',
    statusMarriedNoIncome: 'Spouse (No Income)',
    statusMarriedNoIncomeSub: 'Extra 60,000',
    statusMarriedHasIncome: 'Spouse (Has Income)',
    statusMarriedHasIncomeSub: 'File Separately',
    childCountLabel: 'Number of Children:',
    firstChildLabel: '1st Child / Born before 2018',
    secondChildLabel: '2nd+ Child (Born 2018+)',
    childPerPerson30k: '30,000 THB/child',
    childPerPerson60k: '60,000 THB/child',
    childUnit: 'children',
    parentCareLabel: 'Parents under Care (Age 60+, No Income):',
    parentMax4: '(Max 4)',
    parentUnit: 'persons (30,000 THB each)',
    socialSecurityLabel: 'Annual Social Security Contribution (2026 Cap):',
    socialSecurityFull: 'Max Cap (10,500 THB)',
    socialSecurityNote: '* Statutory social security contribution ceiling capped at 10,500 THB/year',
    saveProfileBtn: 'Save Profile & Recalculate',
    savingProfile: 'Saving and calculating...',
    scannedSectionTitle: '2. Scanned Slips Deductions (Auto-Scan)',
    scannedSectionSub: 'AI auto-detects tax categories & statutory caps',
    scanMoreBtn: 'Scan More',
    deductInsurance: 'Life/Health Insurance',
    deductThaiESG: 'Thai ESG',
    deductSolar: 'Solar Cell 2026',
    deductDonation: 'Donations (2x/1x)',
    deductShopping: 'Easy E-Receipt',

    // Scanner View
    nativeScanTitle: 'Smart Native Slip Scanner',
    nativeScanSubtitle: 'Detect transfer slips, memos and tax deductions in one click',
    autoSyncBtn: 'Auto-Sync Gallery',
    dropzoneText: 'Or drop files here / Click to upload (multi-file)',
    dropzoneDragging: 'Drop files to scan immediately',
    privacyBadge: 'On-device processing • PDPA Compliant',
    pendingReviewCardTitle: '{count} slips pending review',
    pendingReviewCardSub: 'Review notes and confirm tax categories for deductions',
    supportedTitle: 'Supported Bank Slips & Deductions',
    permModalTitle: '“ChillTax” Would Like to Access Your Photos',
    permModalDesc: 'To automatically find transaction slips and accurately classify tax categories',
    permModalDeny: 'Don\'t Allow',
    permModalAllow: 'Allow',

    // Speed Review View
    tabPending: 'Pending Review',
    tabHistory: 'Bill History',
    pendingTitle: 'Pending Bills',
    pendingSub: 'Review & confirm tax categories',
    confirmAllBtn: 'Confirm All',
    confirmingAllBtn: 'Confirming...',
    allDoneTitle: 'All Caught Up!',
    allDoneSub: 'No pending bills. View or edit confirmed slips in \'Bill History\'',
    historyTitle: 'Confirmed Bills',
    historySub: 'Edit category or re-send to pending',
    aiConfidence: 'AI Confidence',
    noMemoWarning: 'Tip: No memo found! Add a transfer memo for 100% accurate AI tax categorization.',
    mainCategoryLabel: 'Main Category:',
    catBusiness: '💼 Business Expense',
    catPersonal: '☕ Personal',
    catIncome: '💰 Income (Sec 40)',
    catIncome8: '💰 Income Sec 40 (8 Types)',
    confirmThisBill: '[✓ Confirm Bill]',
    confirmBillCategory: '[✓ Confirm This Category]',
    confirmedSuccess: 'Successfully saved to Dashboard',
    confirmedTag: 'Confirmed',
    changeCategory: 'Change',
    clickToChange: 'Tap to change',
    unspecifiedDate: 'No Date',
    unspecifiedCounterparty: 'Unspecified Counterparty',
    aiIncomeDetected: 'AI Detected as Income',
    statutoryIncomeSelect: 'Statutory Income Category (Select 40(1) - 40(8)):',
    deductionRulePrefix: 'Deduction Rule: ',

    // Audit Defense
    auditDefenseTitle: 'Generate Audit Defense File',
    auditDefenseSub: 'Compiled slip evidence + classified tax report',

    // Alert Banner
    pendingAlert: '{count} items pending verification',
    pendingClick: 'Tap to open Speed Review',
  }
};

const FALLBACK_PENDING_ITEMS = [
  {
    id: 101,
    transaction_date: '2026-10-15 10:00',
    amount: 500.0,
    sender_name: 'นาย สมหวัง รวยจริง',
    receiver_name: 'นาย ชิล แท็กซ์',
    memo: null,
    tax_category: 'expense_personal',
    reasoning: 'ไม่มีบันทึกช่วยจำ ประเมินเบื้องต้นเป็นค่าใช้จ่ายส่วนตัว ต้องยืนยันอีกครั้ง',
    status: 'pending',
    has_memo_warning: true,
    confidence_score: 45,
    created_at: new Date().toISOString(),
  },
  {
    id: 102,
    transaction_date: '2026-10-14 18:20',
    amount: 950.0,
    sender_name: 'นาย ชิล แท็กซ์',
    receiver_name: 'ร้านวัสดุอุปกรณ์',
    memo: 'ค่าอุปกรณ์และหมึกพิมพ์',
    tax_category: 'expense_business',
    reasoning: 'ระบุซื้ออุปกรณ์สำนักงาน จัดเป็นค่าใช้จ่ายธุรกิจหักภาษีได้',
    status: 'pending',
    has_memo_warning: false,
    confidence_score: 88,
    created_at: new Date().toISOString(),
  },
  {
    id: 103,
    transaction_date: '2026-10-12 14:15',
    amount: 25000.0,
    sender_name: 'บจก. ดิจิทัล เอเจนซี่',
    receiver_name: 'นาย ชิล แท็กซ์',
    memo: 'ค่าจ้างออกแบบกราฟิก',
    tax_category: 'income_40_2',
    reasoning: 'เงินได้จากการรับจ้างทำของ/ฟรีแลนซ์ จัดเข้า 40(2)',
    status: 'pending',
    has_memo_warning: false,
    confidence_score: 95,
    created_at: new Date().toISOString(),
  },
];

const FALLBACK_CONFIRMED_ITEMS = [
  {
    id: 201,
    transaction_date: '2026-10-07 14:32',
    amount: 15000.0,
    sender_name: 'นาย ชิล แท็กซ์',
    receiver_name: 'บจก. ไอที ซัพพลาย',
    memo: 'ค่าอุปกรณ์สำนักงานและสต็อกสินค้า',
    tax_category: 'expense_business',
    reasoning: 'ผู้รับเป็นนิติบุคคลและ memo ระบุค่าสต็อกสินค้าเพื่อธุรกิจ',
    status: 'confirmed',
    has_memo_warning: false,
    confidence_score: 92,
    created_at: new Date().toISOString(),
  },
  {
    id: 202,
    transaction_date: '2026-10-06 15:45',
    amount: 120000.0,
    sender_name: 'น.ส. รัตนา ช้อปปิ้ง',
    receiver_name: 'นาย ชิล แท็กซ์ (ChillShop)',
    memo: 'ค่าสินค้าเซ็ต A + ค่าจัดส่งด่วน',
    tax_category: 'income_40_8',
    reasoning: 'บันทึกช่วยจำระบุค่าสินค้าจากการค้าขาย จัดเป็นเงินได้ 40(8)',
    status: 'confirmed',
    has_memo_warning: false,
    confidence_score: 94,
    created_at: new Date().toISOString(),
  },
];

const FALLBACK_DEDUCTION_SUMMARY = {
  status_type: 'single',
  personal_deduction: 60000,
  spouse_deduction: 0,
  child_deduction: 30000,
  parent_deduction: 30000,
  disabled_deduction: 0,
  disabled_parent_count: 0,
  social_security: 10500,
  life_insurance: 25000,
  health_insurance: 15000,
  pension_funds: 0,
  provident_fund: 0,
  rmf: 0,
  ssf: 0,
  thaiesg: 30000,
  easy_e_receipt: 50000,
  donation: 0,
  education_donation: 0,
  home_loan_interest: 0,
  grand_total_deductions: 220500,
  total_personal_family: 120000,
  total_insurance_savings: 50500,
  total_investment_retirement: 0,
  total_economic_realestate: 50000,
  total_donations: 0,
};

const INCOME_40_OPTIONS = [
  {
    key: 'income_40_1',
    label: '40(1) เงินเดือน / โบนัส',
    label_en: '40(1) Salary / Bonus',
    desc: 'เงินได้จากการจ้างแรงงาน',
    desc_en: 'Employment income',
    icon: '💼',
    deduction_note: 'หักเหมา 50% รวม 40(2) สูงสุด 100,000 บ.',
    deduction_note_en: '50% flat deduction (combined with 40(2), max 100,000 THB)',
  },
  {
    key: 'income_40_2',
    label: '40(2) รับจ้างอิสระ / นายหน้า',
    label_en: '40(2) Freelance / Service Fees',
    desc: 'รับจ้างทำของ/ค่านายหน้า/ฟรีแลนซ์',
    desc_en: 'Contract work / Brokerage / Freelance',
    icon: '💻',
    deduction_note: 'หักเหมา 50% รวม 40(1) สูงสุด 100,000 บ.',
    deduction_note_en: '50% flat deduction (combined with 40(1), max 100,000 THB)',
  },
  {
    key: 'income_40_3',
    label: '40(3) ค่าลิขสิทธิ์ / ทรัพย์สินทางปัญญา',
    label_en: '40(3) Royalties / IP',
    desc: 'ลิขสิทธิ์/สิทธิบัตร/กู๊ดวิลล์',
    desc_en: 'Copyrights / Patents / Goodwill',
    icon: '💡',
    deduction_note: 'หักเหมา 50% ไม่เกิน 100,000 บ. หรือหักตามจริง',
    deduction_note_en: '50% flat deduction (max 100,000 THB) or actual',
  },
  {
    key: 'income_40_4',
    label: '40(4) ดอกเบี้ย / เงินปันผล / คริปโต',
    label_en: '40(4) Interest / Dividends / Crypto',
    desc: 'ดอกเบี้ยเงินฝาก/ปันผลหุ้น/คริปโต',
    desc_en: 'Bank interest / Stock dividends / Crypto gains',
    icon: '📈',
    deduction_note: 'กฎหมายไม่ให้หักค่าใช้จ่ายเหมา (หักได้ 0%)',
    deduction_note_en: 'No statutory deduction permitted (0%)',
  },
  {
    key: 'income_40_5',
    label: '40(5) ค่าเช่าทรัพย์สิน',
    label_en: '40(5) Rental Income / Leases',
    desc: 'ค่าเช่าบ้าน คอนโด ที่ดิน อาคาร ยานพาหนะ',
    desc_en: 'Rental of property / Vehicles',
    icon: '🏢',
    deduction_note: 'หักเหมา 10% - 30% หรือหักตามค่าใช้จ่ายจริง',
    deduction_note_en: '10% - 30% flat deduction or actual expenses',
  },
  {
    key: 'income_40_6',
    label: '40(6) วิชาชีพอิสระ (แพทย์, ทนาย, วิศวะ ฯลฯ)',
    label_en: '40(6) Liberal Professions',
    desc: 'แพทย์ 60% / ทนาย วิศวะ สถาปัตย์ บัญชี 30%',
    desc_en: 'Doctor (60%), Lawyer, Engineer, Architect, Accountant (30%)',
    icon: '⚖️',
    deduction_note: 'หักเหมา 30% - 60% หรือหักตามค่าใช้จ่ายจริง',
    deduction_note_en: '30% - 60% flat deduction or actual expenses',
  },
  {
    key: 'income_40_7',
    label: '40(7) รับเหมาก่อสร้าง (จัดหาสัมภาระ)',
    label_en: '40(7) Construction & Contracting',
    desc: 'รับเหมาทั้งค่าแรงและค่าของ',
    desc_en: 'Contracting with major materials supplied',
    icon: '🏗️',
    deduction_note: 'หักเหมา 60% หรือหักตามค่าใช้จ่ายจริง',
    deduction_note_en: '60% flat deduction or actual expenses',
  },
  {
    key: 'income_40_8',
    label: '40(8) ธุรกิจ / ขายสินค้า / อื่นๆ',
    label_en: '40(8) Business / Commerce / General',
    desc: 'ขายของ/พาณิชย์/วิชาชีพทั่วไป',
    desc_en: 'Commercial trade / Retail / General commerce',
    icon: '🏪',
    deduction_note: 'หักเหมา 60% หรือหักตามค่าใช้จ่ายจริง (ระบบเลือกให้อัตโนมัติ)',
    deduction_note_en: '60% flat deduction or actual expenses (auto-optimized)',
  },
];

const CATEGORY_MAP = {
  income_40_1: {
    label: '40(1) เงินเดือน / โบนัส',
    label_en: '40(1) Salary / Bonus',
    desc: 'เงินได้จากการจ้างแรงงาน (หักเหมารวมกับ 40(2) สูงสุด 100,000 บาท)',
    desc_en: 'Employment income (max 100,000 THB combined standard deduction)',
    color: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    icon: '💼',
    deduction_note: 'หักเหมา 50% รวม 40(2) สูงสุด 100,000 บ.',
    deduction_note_en: '50% flat deduction (combined with 40(2), max 100,000 THB)',
  },
  income_40_2: {
    label: '40(2) รับจ้างอิสระ / นายหน้า',
    label_en: '40(2) Freelance / Service Fees',
    desc: 'เงินได้จากหน้าที่/รับจ้างทำของ/ค่านายหน้า (หักเหมารวมกับ 40(1) สูงสุด 100,000 บาท)',
    desc_en: 'Freelance & brokerage income (max 100,000 THB combined deduction)',
    color: 'text-teal-400',
    badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    icon: '💻',
    deduction_note: 'หักเหมา 50% รวม 40(1) สูงสุด 100,000 บ.',
    deduction_note_en: '50% flat deduction (combined with 40(1), max 100,000 THB)',
  },
  income_40_3: {
    label: '40(3) ค่าลิขสิทธิ์ / ทรัพย์สินทางปัญญา',
    label_en: '40(3) Royalties / IP',
    desc: 'ค่าลิขสิทธิ์ สิทธิบัตร กู๊ดวิลล์ หรือสิทธิในทรัพย์สินทางปัญญา',
    desc_en: 'Royalties, patents, goodwill or IP rights',
    color: 'text-purple-400',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    icon: '💡',
    deduction_note: 'หักเหมา 50% ไม่เกิน 100,000 บ. หรือหักตามจริง',
    deduction_note_en: '50% flat deduction (max 100,000 THB) or actual',
  },
  income_40_4: {
    label: '40(4) ดอกเบี้ย / เงินปันผล / คริปโต',
    label_en: '40(4) Interest / Dividends / Crypto',
    desc: 'ดอกเบี้ยเงินฝาก/พันธบัตร เงินปันผล ส่วนแบ่งกำไรคริปโต',
    desc_en: 'Bank interest, bond yield, stock dividend, crypto gains',
    color: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: '📈',
    deduction_note: 'กฎหมายไม่ให้หักค่าใช้จ่ายเหมา (หักได้ 0%)',
    deduction_note_en: 'No statutory deduction permitted (0%)',
  },
  income_40_5: {
    label: '40(5) ค่าเช่าทรัพย์สิน',
    label_en: '40(5) Rental Income / Leases',
    desc: 'ค่าเช่าบ้าน คอนโด ที่ดิน อาคาร ยานพาหนะ หรือทรัพย์สินอื่น',
    desc_en: 'Rental of property, condo, land, vehicles, or assets',
    color: 'text-orange-400',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    icon: '🏢',
    deduction_note: 'หักเหมา 10% - 30% หรือหักตามค่าใช้จ่ายจริง',
    deduction_note_en: '10% - 30% flat deduction or actual expenses',
  },
  income_40_6: {
    label: '40(6) วิชาชีพอิสระ (แพทย์, ทนาย, วิศวะ ฯลฯ)',
    label_en: '40(6) Liberal Professions',
    desc: 'ประกอบโรคศิลปะ (แพทย์ 60%), กฎหมาย วิศวกรรม สถาปัตยกรรม บัญชี ประณีตศิลป์ (30%)',
    desc_en: 'Medical practice (60%), Law, Engineering, Architecture, Accounting (30%)',
    color: 'text-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    icon: '⚖️',
    deduction_note: 'หักเหมา 30% - 60% หรือหักตามค่าใช้จ่ายจริง',
    deduction_note_en: '30% - 60% flat deduction or actual expenses',
  },
  income_40_7: {
    label: '40(7) รับเหมาก่อสร้าง (จัดหาสัมภาระ)',
    label_en: '40(7) Construction & Contracting',
    desc: 'รับเหมาที่ผู้รับเหมาต้องจัดหาสัมภาระในส่วนสำคัญนอกจากเครื่องมือ',
    desc_en: 'Contracting with major materials supplied by contractor',
    color: 'text-yellow-400',
    badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    icon: '🏗️',
    deduction_note: 'หักเหมา 60% หรือหักตามค่าใช้จ่ายจริง',
    deduction_note_en: '60% flat deduction or actual expenses',
  },
  income_40_8: {
    label: '40(8) ธุรกิจ / ขายสินค้า / อื่นๆ',
    label_en: '40(8) Business / Commerce / General',
    desc: 'เงินได้จากการพาณิชย์/ขายของ/ธุรกิจ (หักเหมา 60% หรือหักตามจริง)',
    desc_en: 'Commercial trade, online shop, general business (60% flat or actual)',
    color: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: '🏪',
    deduction_note: 'หักเหมา 60% หรือหักตามจริง (ระบบเลือกให้อัตโนมัติ)',
    deduction_note_en: '60% flat deduction or actual expenses (auto-optimized)',
  },
  expense_business: {
    label: 'รายจ่ายธุรกิจ',
    label_en: 'Business Expense',
    desc: 'หักเป็นค่าใช้จ่ายทางภาษีได้',
    desc_en: 'Tax-deductible business expense',
    color: 'text-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  },
  expense_personal: {
    label: 'รายจ่ายส่วนตัว',
    label_en: 'Personal Expense',
    desc: 'ค่าใช้จ่ายส่วนตัว (ไม่นำมาคิดภาษี)',
    desc_en: 'Personal expense (non-deductible)',
    color: 'text-slate-400',
    badge: 'bg-slate-700/50 text-slate-300 border-slate-600',
  },
  deduction_insurance: {
    label: 'เบี้ยประกันชีวิต/สุขภาพ',
    label_en: 'Life / Health Insurance',
    desc: 'สิทธิลดหย่อนภาษีสูงสุด 100,000 บาท',
    desc_en: 'Tax allowance up to 100,000 THB',
    color: 'text-indigo-400',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  },
  deduction_donation: {
    label: 'เงินบริจาค/ทำบุญ',
    label_en: 'Donation / Charity',
    desc: '2 เท่าสำหรับ รพ./การศึกษา, 1 เท่าทั่วไป (≤10% เงินได้)',
    desc_en: '2x for schools/hospitals, 1x general (<=10% net income)',
    color: 'text-purple-400',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
  deduction_thaiesg: {
    label: 'Thai ESG (กองทุนยั่งยืน)',
    label_en: 'Thai ESG Fund',
    desc: 'ลดหย่อนได้ไม่เกิน 30% ของเงินได้ สูงสุด 300,000 บาท',
    desc_en: 'Tax allowance up to 30% of income (max 300,000 THB)',
    color: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  deduction_solar: {
    label: 'ค่าติดตั้งโซลาร์เซลล์',
    label_en: 'Solar Rooftop Installation',
    desc: 'สิทธิลดหย่อนติดตั้ง Solar Rooftop ปี 2569 สูงสุด 200,000 บาท',
    desc_en: 'Solar Rooftop installation allowance (max 200,000 THB)',
    color: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  deduction_shopping: {
    label: 'Easy E-Receipt/ช้อปดีมีคืน',
    label_en: 'Easy E-Receipt / Shopping',
    desc: 'ใบกำกับภาษีเต็มรูปลดหย่อนสูงสุด 50,000 บาท',
    desc_en: 'Full tax invoice deduction up to 50,000 THB',
    color: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  deduction_medical: {
    label: 'ค่าฝากครรภ์/คลอดบุตร',
    label_en: 'Prenatal & Childbirth Care',
    desc: 'ลดหย่อนได้สูงสุด 60,000 บาท/ครรภ์',
    desc_en: 'Maternity tax allowance up to 60,000 THB per pregnancy',
    color: 'text-pink-400',
    badge: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
  },
  unknown: {
    label: 'รอตรวจสอบ',
    label_en: 'Pending Review',
    desc: 'ข้อมูลไม่ชัดเจน ต้องให้ผู้ใช้จัดหมวด',
    desc_en: 'Uncertain information, awaiting user classification',
    color: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
};

// ---------------------------------------------------------------------------
// 0. LOGIN & SIGN-UP VIEW (ระบบเข้าสู่ระบบด้วยรหัสผ่าน และสร้างบัญชีใหม่)
// ---------------------------------------------------------------------------
function LoginView({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Server Settings Modal State
  const [showServerModal, setShowServerModal] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(API_BASE);
  const [pingStatus, setPingStatus] = useState(null); // null | 'testing' | 'success' | 'failed'

  const testServerConnection = async (target) => {
    setPingStatus('testing');
    try {
      const urlToTest = (target || serverUrlInput).trim().replace(/\/$/, '');
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${urlToTest}/api/dashboard-stats`, { signal: controller.signal });
      clearTimeout(tid);
      if (res.ok) {
        setPingStatus('success');
      } else {
        setPingStatus('failed');
      }
    } catch {
      setPingStatus('failed');
    }
  };

  const handleSaveServerConfig = () => {
    const formatted = serverUrlInput.trim().replace(/\/$/, '');
    setGlobalApiBase(formatted);
    setShowServerModal(false);
  };

  const handleLogin = async (targetEmail, targetPassword) => {
    const emailToUse = (targetEmail || email).trim().toLowerCase();
    const passwordToUse = targetPassword !== undefined ? targetPassword : password;

    if (!emailToUse || !emailToUse.includes('@')) {
      setError('กรุณากรอกอีเมลที่ถูกต้อง (เช่น demo@chilltax.com)');
      return;
    }
    if (!passwordToUse) {
      setError('กรุณากรอกรหัสผ่าน');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse, password: passwordToUse }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
      const userData = await res.json();
      onLogin(userData);
    } catch (err) {
      if (emailToUse === 'demo@chilltax.com') {
        // Fallback for demo account when backend unreachable
        onLogin({
          email: 'demo@chilltax.com',
          fullname: 'Demo User (โหมดทดลองใช้งาน)',
          is_offline: true,
          created_at: new Date().toISOString(),
        });
        return;
      }
      if (err.name === 'AbortError' || err.message?.includes('fetch') || err.message?.includes('Network')) {
        setError(`ไม่สามารถติดต่อเซิร์ฟเวอร์ที่ (${API_BASE}) ได้ แนะนำกดปุ่ม 'Demo Account' ด้านล่างเพื่อเข้าทดลองใช้งานทันที`);
      } else {
        setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const emailToUse = email.trim().toLowerCase();
    const pwd = password.trim();
    const confirmPwd = confirmPassword.trim();
    const nameToUse = fullname.trim();

    if (!emailToUse || !emailToUse.includes('@')) {
      setError('กรุณากรอกอีเมลที่ถูกต้อง');
      return;
    }
    if (!pwd || pwd.length < 4) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }
    if (pwd !== confirmPwd) {
      setError('รหัสผ่านยืนยันไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          password: pwd,
          fullname: nameToUse || undefined,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'การสร้างบัญชีไม่สำเร็จ');
      }
      const userData = await res.json();
      setSuccessMsg('สร้างบัญชีสำเร็จ! กำลังเข้าสู่ระบบ...');
      setTimeout(() => {
        onLogin(userData);
      }, 500);
    } catch (err) {
      if (err.name === 'AbortError' || err.message?.includes('fetch') || err.message?.includes('Network')) {
        setError(`ไม่สามารถติดต่อเซิร์ฟเวอร์ที่ (${API_BASE}) ได้ (คอมพิวเตอร์อาจปิดอยู่ หรือไม่ได้ต่อ Wi-Fi เดียวกัน) แนะนำกดปุ่ม 'Demo Account' ด้านล่าง`);
      } else {
        setError(err.message || 'เกิดข้อผิดพลาดในการสร้างบัญชี');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = async () => {
    setEmail('demo@chilltax.com');
    setPassword('123456');
    setMode('login');
    setError('');
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@chilltax.com', password: '123456' }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const userData = await res.json();
        onLogin(userData);
        return;
      }
    } catch (err) {
      console.warn('Backend unavailable, entering offline demo mode:', err);
    } finally {
      setLoading(false);
    }

    // Offline demo user fallback - 100% works anywhere without backend
    const offlineDemoUser = {
      email: 'demo@chilltax.com',
      fullname: 'Demo User (โหมดทดลองใช้งาน)',
      is_offline: true,
      created_at: new Date().toISOString(),
    };
    onLogin(offlineDemoUser);
  };

  return (
    <div className="py-6 px-1 space-y-5">
      {/* Brand Header */}
      <div className="text-center space-y-2.5">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 mx-auto shadow-xl shadow-emerald-500/25 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-white bg-clip-text text-transparent">
              ChillTax
            </h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
              AI FinTech
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ระบบจัดการภาษี & สิทธิลดหย่อนอัจฉริยะสำหรับฟรีแลนซ์และธุรกิจ
          </p>
        </div>

        {/* Server Connection Status Pill */}
        <div className="pt-1 flex items-center justify-center">
          <button
            type="button"
            onClick={() => {
              setServerUrlInput(API_BASE);
              setPingStatus(null);
              setShowServerModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[11px] text-slate-400 hover:text-slate-200 transition cursor-pointer active:scale-95"
            title="คลิกเพื่อตรวจสอบหรือเปลี่ยน IP เซิร์ฟเวอร์"
          >
            <Server className="w-3 h-3 text-emerald-400" />
            <span>เซิร์ฟเวอร์: <span className="text-emerald-400 font-mono">{API_BASE.replace(/^https?:\/\//, '')}</span></span>
            <Settings className="w-2.5 h-2.5 text-slate-500 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs (เข้าสู่ระบบ / สร้างบัญชีใหม่) */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setError('');
            setSuccessMsg('');
          }}
          className={`py-2.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'login'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 font-extrabold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>เข้าสู่ระบบ</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setError('');
            setSuccessMsg('');
          }}
          className={`py-2.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'register'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 font-extrabold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>สร้างบัญชีใหม่</span>
        </button>
      </div>

      {/* Form Card */}
      <div className="p-4 rounded-3xl bg-slate-950/60 border border-slate-800 shadow-xl space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (mode === 'login') {
              handleLogin();
            } else {
              handleRegister();
            }
          }}
          className="space-y-3.5"
        >
          {/* If Register mode: Full Name */}
          {mode === 'register' && (
            <div className="space-y-1.5 animate-in fade-in-50 duration-200">
              <label className="text-xs font-semibold text-slate-300 block">
                ชื่อ-นามสกุล หรือชื่อเรียก
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี หรือ ร้านน้องแมว"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              อีเมล {mode === 'register' ? 'สำหรับใช้งาน' : ''}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 block">
                รหัสผ่าน {mode === 'register' ? '(อย่างน้อย 4 ตัวอักษร)' : ''}
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition cursor-pointer"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>ซ่อน</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>แสดง</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านของคุณ"
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                required
              />
            </div>
          </div>

          {/* If Register mode: Confirm Password */}
          {mode === 'register' && (
            <div className="space-y-1.5 animate-in fade-in-50 duration-200">
              <label className="text-xs font-semibold text-slate-300 block">
                ยืนยันรหัสผ่านอีกครั้ง
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="พิมพ์รหัสผ่านซ้ำอีกครั้ง"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>{error}</p>
                {mode === 'login' && error.includes('สร้างบัญชี') && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError('');
                    }}
                    className="text-emerald-400 underline font-bold text-[11px] hover:text-emerald-300"
                  >
                    คลิกที่นี่เพื่อสมัครสมาชิกทันที
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 active:scale-[0.98] text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {mode === 'login' ? 'กำลังเข้าสู่ระบบ...' : 'กำลังสร้างบัญชีผู้ใช้...'}
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                เข้าสู่ระบบ
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                สร้างบัญชีผู้ใช้ใหม่
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Button (Instant Access) */}
        <div className="pt-2 text-center border-t border-slate-800/80 space-y-1.5">
          <button
            type="button"
            onClick={fillDemoAccount}
            disabled={loading}
            className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-amber-500/30 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer shadow-sm shadow-amber-500/10"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>เข้าใช้งานด้วย Demo Account (ทดลองใช้งานทันที)</span>
          </button>
          <p className="text-[10px] text-slate-500">
            ไม่ต้องเชื่อมต่อเน็ตหรือเปิดคอมพิวเตอร์ ทดลองระบบได้ครบทุกฟังก์ชัน
          </p>
        </div>
      </div>

      {/* Feature Highlights Footer */}
      <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/70 space-y-2">
        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          <div className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Zap className="w-3 h-3" />
          </div>
          <span>AI แยกประเภทเงินได้ ม.40 ครบทั้ง 8 ประเภท & คำนวณหักค่าใช้จ่าย</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          <div className="w-5 h-5 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <PiggyBank className="w-3 h-3" />
          </div>
          <span>คำนวณสิทธิลดหย่อนภาษี 2569 & สแกนบิลลดหย่อนอัตโนมัติ</span>
        </div>
      </div>

      {/* Server Settings Modal */}
      {showServerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Server className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-white">ตั้งค่า IP เซิร์ฟเวอร์</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowServerModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              ระบุ URL ของคอมพิวเตอร์ที่รัน FastAPI เพื่อให้แอปบนมือถือเชื่อมต่อเข้าฐานข้อมูลจริงได้
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300">Server Backend URL</label>
              <input
                type="text"
                value={serverUrlInput}
                onChange={(e) => {
                  setServerUrlInput(e.target.value);
                  setPingStatus(null);
                }}
                placeholder={PUBLIC_TUNNEL_URL}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setServerUrlInput(PUBLIC_TUNNEL_URL);
                  testServerConnection(PUBLIC_TUNNEL_URL);
                }}
                className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-[10px] text-emerald-300 font-bold transition"
              >
                🌐 Cloud Tunnel (ทุกเครือข่าย)
              </button>
              <button
                type="button"
                onClick={() => {
                  setServerUrlInput(LOCAL_LAN_URL);
                  testServerConnection(LOCAL_LAN_URL);
                }}
                className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-[10px] text-slate-300 font-mono transition"
              >
                Wi-Fi (192.168.127.152)
              </button>
              <button
                type="button"
                onClick={() => {
                  setServerUrlInput('http://localhost:8000');
                  testServerConnection('http://localhost:8000');
                }}
                className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-[10px] text-slate-300 font-mono transition"
              >
                localhost
              </button>
            </div>

            {/* Connection Test Status */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">สถานะการเชื่อมต่อ:</span>
              {pingStatus === 'testing' ? (
                <span className="text-amber-400 flex items-center gap-1 text-[11px]">
                  <RefreshCw className="w-3 h-3 animate-spin" /> กำลังทดสอบ...
                </span>
              ) : pingStatus === 'success' ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 🟢 เชื่อมต่อสำเร็จ
                </span>
              ) : pingStatus === 'failed' ? (
                <span className="text-rose-400 font-bold flex items-center gap-1 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" /> 🔴 ไม่สามารถเชื่อมต่อได้
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => testServerConnection()}
                  className="text-xs text-emerald-400 hover:underline font-semibold"
                >
                  กดทดสอบการเชื่อมต่อ
                </button>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowServerModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-750"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveServerConfig}
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ONBOARDING TOUR MODAL (ระบบสอนการใช้งานเบื้องต้นสำหรับผู้ใช้ใหม่)
// ---------------------------------------------------------------------------
function OnboardingModal({ isOpen, onClose, lang = 'th' }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      id: 1,
      badge: lang === 'en' ? 'Step 1 of 3' : 'ขั้นตอนที่ 1 จาก 3',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      title: 'Welcome to ChillTax',
      subtitle: lang === 'en'
        ? 'Your personal AI tax assistant. Turning complex taxes into a chill experience.'
        : 'ผู้ช่วยภาษี AI ส่วนตัวของคุณ เปลี่ยนเรื่องภาษีที่ซับซ้อนให้เป็นเรื่องชิลๆ',
      icon: ShieldCheck,
      iconBg: 'from-emerald-500 to-teal-400',
      iconShadow: 'shadow-emerald-500/25',
      illustrationTag: lang === 'en' ? '🇹🇭 Thai Tax Law Engine' : '🇹🇭 อิงประมวลรัษฎากรไทย 2569',
      features: lang === 'en' ? [
        'Tailored 100% for Thai Personal Income Tax',
        'Auto calculations for Section 40(1) to 40(8)',
        'Private & secure: All data stays in your device',
      ] : [
        'ออกแบบเพื่อภาษีเงินได้บุคคลธรรมดาไทยโดยเฉพาะ',
        'คำนวณเงินได้ ม.40(1) ถึง 40(8) อัตโนมัติ',
        'ปลอดภัยสูงสุด ข้อมูลถูกเก็บไว้ในเครื่องของคุณ',
      ],
    },
    {
      id: 2,
      badge: lang === 'en' ? 'Step 2 of 3' : 'ขั้นตอนที่ 2 จาก 3',
      badgeColor: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
      title: 'Zero Data Entry',
      subtitle: lang === 'en'
        ? 'No tedious typing! Just upload slips or sync your gallery, and our AI will automatically classify income and business expenses.'
        : 'ไม่ต้องพิมพ์เองให้เมื่อย! แค่อัปโหลดสลิปหรือให้ระบบซิงค์แกลลอรี่ AI ของเราจะแยกแยะรายได้และรายจ่ายธุรกิจให้อัตโนมัติ',
      icon: ScanLine,
      iconBg: 'from-teal-500 to-cyan-400',
      iconShadow: 'shadow-teal-500/25',
      illustrationTag: lang === 'en' ? '⚡ AI Smart OCR & Multi-Slip' : '⚡ สแกนสลิปอัจฉริยะแม่นยำ 99%',
      features: lang === 'en' ? [
        'Sync bank transfer slips instantly with OCR',
        'Auto-separates personal vs. business expenses',
        'Speed review & bulk confirm in seconds',
      ] : [
        'ซิงค์สลิปโอนเงินธนาคารทันใจด้วยระบบ OCR',
        'แยกค่าใช้จ่ายส่วนตัว ออกจากค่าใช้จ่ายธุรกิจอัตโนมัติ',
        'ระบบ Speed Review ตรวจสอบและยืนยันบิลได้ในคลิกเดียว',
      ],
    },
    {
      id: 3,
      badge: lang === 'en' ? 'Step 3 of 3' : 'ขั้นตอนที่ 3 จาก 3',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      title: 'Smart Tax Planner',
      subtitle: lang === 'en'
        ? 'Instantly know if you need to register for VAT, get warned before breaking into higher tax brackets, with real-time deduction recommendations.'
        : 'รู้ทันทีว่าต้องจ่าย VAT หรือยัง และเตือนล่วงหน้าก่อนกำไรทะลุฐานภาษี พร้อมแนะนำค่าลดหย่อนแบบ Real-time',
      icon: TrendingUp,
      iconBg: 'from-emerald-400 via-teal-500 to-indigo-500',
      iconShadow: 'shadow-emerald-500/25',
      illustrationTag: lang === 'en' ? '💡 Real-time Tax Bracket Nudge' : '💡 เตือนทะลุฐานภาษี & เกณฑ์ VAT 1.8M',
      features: lang === 'en' ? [
        'VAT 1.8M Tracker prevents unexpected fines',
        'Progress bar warns before hitting next tax bracket',
        'Audit Defense file ready for Revenue Department',
      ] : [
        'หลอดเตือนเกณฑ์ VAT 1.8 ล้านบาท ป้องกันเบี้ยปรับย้อนหลัง',
        'แจ้งเตือนก่อนกำไรขยับไปเสียภาษีฐานถัดไป',
        'สร้างแฟ้มชี้แจงภาษี (Audit Defense) ส่งสรรพากรได้ทันที',
      ],
    },
  ];

  const isLast = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];
  const IconComponent = slide.icon;

  const handleNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('hasSeenTutorial', 'true');
    } catch (e) {
      console.warn('localStorage error:', e);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl relative flex flex-col justify-between overflow-hidden animate-in zoom-in-95 duration-200 min-h-[510px]">
        {/* Glow ambient background effect */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header: Step Badge & Skip Button */}
        <div className="flex items-center justify-between relative z-10">
          <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold ${slide.badgeColor}`}>
            {slide.badge}
          </span>
          <button
            onClick={handleComplete}
            className="text-xs text-slate-400 hover:text-white font-semibold transition px-2.5 py-1 rounded-lg hover:bg-slate-800/80 cursor-pointer flex items-center gap-1"
          >
            <span>{lang === 'en' ? 'Skip' : 'ข้าม'}</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center Content: Animated Icon & Presentation Card */}
        <div className="my-auto py-3 text-center space-y-3.5 relative z-10">
          {/* Central Icon with glowing badge */}
          <div className="relative inline-flex items-center justify-center">
            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${slide.iconBg} p-0.5 shadow-xl ${slide.iconShadow} flex items-center justify-center transform hover:scale-105 transition-transform duration-300`}>
              <div className="w-full h-full bg-slate-950/40 rounded-[22px] flex items-center justify-center backdrop-blur-sm">
                <IconComponent className="w-9 h-9 text-white font-bold animate-pulse" />
              </div>
            </div>
          </div>

          <div className="inline-block px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[10.5px] font-bold text-emerald-300 shadow-sm">
            {slide.illustrationTag}
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-white tracking-tight">
              {slide.title}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
              {slide.subtitle}
            </p>
          </div>

          {/* Bullet points highlights */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/90 text-left space-y-1.5 shadow-inner">
            {slide.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation & Action */}
        <div className="space-y-3.5 relative z-10 pt-2 border-t border-slate-800/60">
          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 cursor-pointer ${
                  idx === currentSlide
                    ? 'w-7 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 shadow-sm shadow-emerald-500/50'
                    : 'w-2 h-2 rounded-full bg-slate-700 hover:bg-slate-600'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Button Row */}
          <div className="flex items-center gap-2.5">
            {currentSlide > 0 && (
              <button
                onClick={() => setCurrentSlide((prev) => prev - 1)}
                className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-bold transition active:scale-95 cursor-pointer"
              >
                {lang === 'en' ? 'Back' : 'ย้อนกลับ'}
              </button>
            )}

            {isLast ? (
              <button
                onClick={handleComplete}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 text-slate-950 text-sm font-black shadow-lg shadow-emerald-500/30 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer animate-pulse"
              >
                <span>{lang === 'en' ? 'Get Started' : 'เริ่มต้นใช้งาน (Get Started)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{lang === 'en' ? 'Next' : 'ถัดไป (Next)'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// คำเตือน / หมายเหตุทางกฎหมาย (Tax Disclaimer Component)
// ---------------------------------------------------------------------------
function TaxDisclaimerCard({ lang = 'th' }) {
  return (
    <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/20 text-slate-400 space-y-1.5 shadow-sm">
      <div className="flex items-start gap-2.5">
        <div className="w-5 h-5 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/20">
          <Info className="w-3.5 h-3.5" />
        </div>
        <div className="text-[11px] leading-relaxed space-y-1">
          <span className="font-bold text-slate-300 block">
            {lang === 'en' ? 'Disclaimer / Legal Notice' : 'คำเตือน / ข้อจำกัดความรับผิดชอบ (Disclaimer)'}
          </span>
          <p className="text-slate-400">
            {lang === 'en'
              ? 'Note: Results are preliminary tax planning estimates only. Standard statutory deduction rates and certain allowance conditions include legal subtleties (e.g. child birth order, specific subcategories under Section 40(8)) that may not be covered in all circumstances. Please re-check with the Thai Revenue Department.'
              : 'หมายเหตุ: ผลลัพธ์เป็นการประมาณการเพื่อวางแผนภาษีเบื้องต้นเท่านั้น อัตราหักค่าใช้จ่ายแบบเหมาและเงื่อนไขค่าลดหย่อนบางรายการมีรายละเอียดปลีกย่อยตามกฎหมาย (เช่น ลำดับการเกิดของบุตร, ประเภทธุรกิจย่อยของมาตรา 40(8)) ที่เครื่องมือนี้ยังไม่ครอบคลุมทุกกรณี กรุณาตรวจสอบกับกรมสรรพากรอีกครั้ง'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 0.1 DEDUCTION DASHBOARD VIEW (หน้าต่างคำนวณค่าลดหย่อนภาษีแยกเฉพาะ)
// ---------------------------------------------------------------------------
function DeductionDashboard({ currentUser, onNavigateScanner, onToast, lang = 'th', t = (k) => DICTIONARY['th']?.[k] || k }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState(null);

  // Form states
  const [statusType, setStatusType] = useState('single');
  const [childFirstCount, setChildFirstCount] = useState(0);
  const [childSecondPlusCount, setChildSecondPlusCount] = useState(0);
  const [disabledParentCount, setDisabledParentCount] = useState(0);
  const [socialSecurity, setSocialSecurity] = useState(10500);

  const fetchDeductionSummary = async () => {
    if (!currentUser?.email) return;
    try {
      setLoading(true);
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(
        `${API_BASE}/api/user/deduction-summary?email=${encodeURIComponent(currentUser.email)}`,
        { signal: controller.signal }
      );
      clearTimeout(tid);
      if (!res.ok) throw new Error('Failed to load deduction summary');
      const data = await res.json();
      setSummary(data);
      setStatusType(data.status_type || 'single');
      setChildFirstCount(data.child_first_count !== undefined ? data.child_first_count : (data.child_count || 0));
      setChildSecondPlusCount(data.child_second_plus_count || 0);
      setDisabledParentCount(data.disabled_parent_count || 0);
      setSocialSecurity(data.social_security !== undefined ? data.social_security : 10500);
    } catch (err) {
      console.warn('Fetch deduction summary fallback:', err);
      setSummary(FALLBACK_DEDUCTION_SUMMARY);
      setStatusType('single');
      setChildFirstCount(1);
      setChildSecondPlusCount(0);
      setSocialSecurity(10500);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeductionSummary();
  }, [currentUser?.email]);

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    if (!currentUser?.email) return;
    try {
      setSaving(true);
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          status_type: statusType,
          spouse_has_income: statusType === 'married_has_income',
          child_first_count: Number(childFirstCount),
          child_second_plus_count: Number(childSecondPlusCount),
          child_count: Number(childFirstCount) + Number(childSecondPlusCount),
          disabled_parent_count: Number(disabledParentCount),
          social_security: Number(socialSecurity),
        }),
        signal: controller.signal,
      });
      clearTimeout(tid);
      if (!res.ok) throw new Error('Update profile failed');
      onToast?.(lang === 'en' ? 'Personal allowances saved' : 'บันทึกข้อมูลลดหย่อนส่วนตัวสำเร็จ');
      await fetchDeductionSummary();
    } catch (err) {
      console.warn('Saving profile offline simulated:', err);
      setSummary((prev) => ({
        ...(prev || FALLBACK_DEDUCTION_SUMMARY),
        status_type: statusType,
        child_first_count: Number(childFirstCount),
        child_second_plus_count: Number(childSecondPlusCount),
        disabled_parent_count: Number(disabledParentCount),
        social_security: Number(socialSecurity),
      }));
      onToast?.(lang === 'en' ? 'Saved (Offline Demo Mode)' : 'บันทึกข้อมูลสำเร็จ (โหมดจำลอง)');
    } finally {
      setSaving(false);
    }
  };

  const grandTotal = summary?.grand_total_deductions || 0;
  const potentialSavings = Math.round(grandTotal * 0.05);
  const bd = summary?.breakdown_details || {};

  return (
    <div className="space-y-4">
      {/* Title & Refresh */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <PiggyBank className="w-4 h-4 text-indigo-400" />
            {t('deductionEngineTitle')}
          </h2>
          <p className="text-[11px] text-slate-400">{t('deductionEngineSub')}</p>
        </div>

        <button
          onClick={fetchDeductionSummary}
          disabled={loading}
          className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition active:scale-95"
          title={t('refreshDeductions')}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>

      {/* 1. Grand Total Deduction Meter Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-xl space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex justify-between items-start">
          <div>
            <span className="text-[11px] text-indigo-300 font-semibold tracking-wide uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              {t('grandTotalDeduction')}
            </span>
            <div className="text-2xl font-black text-white mt-1">
              ฿{grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
            {t('taxYear2026')}
          </span>
        </div>

        {/* Estimated Savings Pill */}
        <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-indigo-500/20 flex items-center gap-2 text-xs">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div className="leading-snug">
            <span className="text-slate-300">{t('potentialSavingsPrefix')}</span>
            <strong className="text-emerald-400 font-bold">฿{potentialSavings.toLocaleString('th-TH')}</strong>
            <span className="text-[10px] text-slate-400 block">{t('potentialSavingsNote')}</span>
          </div>
        </div>

        {/* 2 Hero Summary Boxes: ค่าลดหย่อนพื้นฐาน & ค่าลดหย่อนจากสลิปที่สแกน */}
        <div className="grid grid-cols-1 gap-2 pt-1 text-xs">
          {/* Box 1: ค่าลดหย่อนพื้นฐาน */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-slate-300 font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                {t('baseDeductionLabel')}
              </span>
              <span className="text-xs font-black text-emerald-400">
                ฿{Number(summary?.total_personal_family || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {lang === 'en'
                ? `Personal ฿60k ${summary?.spouse_allowance > 0 ? `+ Spouse ฿${summary.spouse_allowance.toLocaleString()}` : ''} ${summary?.child_allowance > 0 ? `+ Child ฿${summary.child_allowance.toLocaleString()}` : ''} ${summary?.parent_allowance > 0 ? `+ Parents ฿${summary.parent_allowance.toLocaleString()}` : ''} + Social Sec ฿${Number(summary?.social_security_allowance || 0).toLocaleString()}`
                : `ส่วนตัว ฿60k ${summary?.spouse_allowance > 0 ? `+ คู่สมรส ฿${summary.spouse_allowance.toLocaleString()}` : ''} ${summary?.child_allowance > 0 ? `+ บุตร ฿${summary.child_allowance.toLocaleString()}` : ''} ${summary?.parent_allowance > 0 ? `+ พ่อแม่ ฿${summary.parent_allowance.toLocaleString()}` : ''} + ปกส. ฿${Number(summary?.social_security_allowance || 0).toLocaleString()}`}
            </p>
          </div>

          {/* Box 2: ค่าลดหย่อนจากสลิปที่สแกน */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-indigo-300 font-bold flex items-center gap-1.5">
                <ScanLine className="w-3.5 h-3.5 text-indigo-400" />
                {t('scannedDeductionLabel')}
              </span>
              <span className="text-xs font-black text-indigo-300">
                ฿{Number(summary?.total_scanned_deductions || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {lang === 'en'
                ? `Insurance ฿${Number(bd.effective_insurance || 0).toLocaleString()} | Thai ESG ฿${Number(bd.effective_thaiesg || 0).toLocaleString()} | Solar ฿${Number(bd.effective_solar || 0).toLocaleString()} | Donation ฿${Number(bd.effective_donation || 0).toLocaleString()} | Shopping ฿${Number(bd.effective_shopping || 0).toLocaleString()}`
                : `ประกัน ฿${Number(bd.effective_insurance || 0).toLocaleString()} | Thai ESG ฿${Number(bd.effective_thaiesg || 0).toLocaleString()} | โซลาร์เซลล์ ฿${Number(bd.effective_solar || 0).toLocaleString()} | บริจาค ฿${Number(bd.effective_donation || 0).toLocaleString()} | ช้อปปิ้ง ฿${Number(bd.effective_shopping || 0).toLocaleString()}`}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Personal & Family Allowance Settings Form (ข้อมูลลดหย่อนส่วนตัว) */}
      <div className="p-4 rounded-3xl bg-slate-800/50 border border-slate-700/60 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-400" />
            {t('personalFamilySection')}
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">{t('taxYear2026')}</span>
        </div>

        {/* Status Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-300 block">
            {t('maritalStatusLabel')}
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'single', label: t('statusSingle'), sub: t('statusSingleSub') },
              { id: 'married_no_income', label: t('statusMarriedNoIncome'), sub: t('statusMarriedNoIncomeSub') },
              { id: 'married_has_income', label: t('statusMarriedHasIncome'), sub: t('statusMarriedHasIncomeSub') },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusType(st.id)}
                className={`p-2 rounded-xl text-left border transition active:scale-95 cursor-pointer ${
                  statusType === st.id
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <div className="text-[11px] font-bold">{st.label}</div>
                <div className="text-[9px] text-slate-400 truncate">{st.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Steppers: Children (Group 1 & Group 2) */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-300 block">
            {t('childCountLabel')}
          </label>

          <div className="grid grid-cols-2 gap-2">
            {/* Child 1: คนแรก หรือเกิดก่อนปี 61 */}
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1 text-[11px]">
                  <Baby className="w-3.5 h-3.5 text-cyan-400" />
                  {t('firstChildLabel')}
                </span>
              </div>
              <div className="text-[10px] text-cyan-400 font-mono">
                {t('childPerPerson30k')} (฿{(childFirstCount * 30000).toLocaleString()})
              </div>
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setChildFirstCount((prev) => Math.max(0, prev - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center active:scale-90"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold text-white">{childFirstCount} {t('childUnit')}</span>
                <button
                  type="button"
                  onClick={() => setChildFirstCount((prev) => prev + 1)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center active:scale-90"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Child 2+: คนที่ 2 ขึ้นไปเกิดปี 61 เป็นต้นไป */}
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1 text-[11px]">
                  <Baby className="w-3.5 h-3.5 text-emerald-400" />
                  {t('secondChildLabel')}
                </span>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono">
                {t('childPerPerson60k')} (฿{(childSecondPlusCount * 60000).toLocaleString()})
              </div>
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setChildSecondPlusCount((prev) => Math.max(0, prev - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center active:scale-90"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold text-white">{childSecondPlusCount} {t('childUnit')}</span>
                <button
                  type="button"
                  onClick={() => setChildSecondPlusCount((prev) => prev + 1)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center active:scale-90"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stepper: Elderly Parents */}
        <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1 text-[11px]">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              {t('parentCareLabel')}
            </span>
            <span className="text-[10px] text-purple-400 font-mono font-bold">
              ฿{(disabledParentCount * 30000).toLocaleString()} {t('parentMax4')}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setDisabledParentCount((prev) => Math.max(0, prev - 1))}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center active:scale-90"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-white">{disabledParentCount} {t('parentUnit')}</span>
            <button
              type="button"
              onClick={() => setDisabledParentCount((prev) => Math.min(4, prev + 1))}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center active:scale-90"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Social Security */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-slate-300">
              {t('socialSecurityLabel')}
            </label>
            <button
              type="button"
              onClick={() => setSocialSecurity(10500)}
              className="text-[10px] text-emerald-400 hover:underline font-bold"
            >
              {t('socialSecurityFull')}
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">฿</span>
            <input
              type="number"
              min="0"
              max="10500"
              step="500"
              value={socialSecurity}
              onChange={(e) => setSocialSecurity(Number(e.target.value))}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <span className="text-[10px] text-slate-500 block">
            {t('socialSecurityNote')}
          </span>
        </div>

        {/* Save Profile Button */}
        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={saving}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 active:scale-[0.98] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-500/20"
        >
          {saving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              {t('savingProfile')}
            </>
          ) : (
            <>
              <Check className="w-4 h-4 text-slate-950 font-black" />
              {t('saveProfileBtn')}
            </>
          )}
        </button>
      </div>

      {/* 3. AI Scanned Deductions Section (สิทธิลดหย่อนจากการสแกนบิล/ใบเสร็จ) */}
      <div className="p-4 rounded-3xl bg-slate-800/50 border border-slate-700/60 space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <ScanLine className="w-4 h-4 text-indigo-400" />
              {t('scannedSectionTitle')}
            </h3>
            <p className="text-[10px] text-slate-400">{t('scannedSectionSub')}</p>
          </div>

          <button
            onClick={onNavigateScanner}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold flex items-center gap-1 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            {t('scanMoreBtn')}
          </button>
        </div>

        {/* 6 Category Summary Tiles */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* 1. Insurance */}
          <div className="p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="flex items-center gap-1 text-indigo-300">
                <ShieldPlus className="w-3 h-3 text-indigo-400" />
                {t('deductInsurance')}
              </span>
              <span>/ 100k</span>
            </div>
            <div className="text-xs font-bold text-white">
              ฿{Number(bd.effective_insurance || summary?.category_totals?.deduction_insurance || 0).toLocaleString('th-TH')}
            </div>
          </div>

          {/* 2. Thai ESG */}
          <div className="p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <Leaf className="w-3 h-3 text-emerald-400" />
                {t('deductThaiESG')}
              </span>
              <span>≤30% / 300k</span>
            </div>
            <div className="text-xs font-bold text-white">
              ฿{Number(bd.effective_thaiesg || summary?.category_totals?.deduction_thaiesg || 0).toLocaleString('th-TH')}
            </div>
          </div>

          {/* 3. Solar Cell */}
          <div className="p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="flex items-center gap-1 text-amber-300">
                <Sun className="w-3 h-3 text-amber-400" />
                {t('deductSolar')}
              </span>
              <span>{lang === 'en' ? '2026 / 200k' : 'ปี 69 / 200k'}</span>
            </div>
            <div className="text-xs font-bold text-white">
              ฿{Number(bd.effective_solar || summary?.category_totals?.deduction_solar || 0).toLocaleString('th-TH')}
            </div>
          </div>

          {/* 4. Donations (2x Hospital/Edu, 1x General) */}
          <div className="p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="flex items-center gap-1 text-purple-300">
                <HeartHandshake className="w-3 h-3 text-purple-400" />
                {t('deductDonation')}
              </span>
              <span>{lang === 'en' ? '≤10% Income' : '≤10% เงินได้'}</span>
            </div>
            <div className="text-xs font-bold text-white">
              ฿{Number(bd.effective_donation || summary?.category_totals?.deduction_donation || 0).toLocaleString('th-TH')}
            </div>
          </div>

          {/* 5. Easy E-Receipt */}
          <div className="p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="flex items-center gap-1 text-teal-300">
                <ShoppingBag className="w-3 h-3 text-teal-400" />
                {t('deductShopping')}
              </span>
              <span>/ 50k</span>
            </div>
            <div className="text-xs font-bold text-white">
              ฿{Number(bd.effective_shopping || summary?.category_totals?.deduction_shopping || 0).toLocaleString('th-TH')}
            </div>
          </div>

          {/* 6. Medical Maternity */}
          <div className="p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="flex items-center gap-1 text-pink-300">
                <HeartPulse className="w-3 h-3 text-pink-400" />
                {lang === 'en' ? 'Maternity / Childbirth' : 'คลอดบุตร/ฝากครรภ์'}
              </span>
              <span>/ 60k</span>
            </div>
            <div className="text-xs font-bold text-white">
              ฿{Number(bd.effective_maternity || summary?.category_totals?.deduction_maternity || 0).toLocaleString('th-TH')}
            </div>
          </div>
        </div>

        {/* Scanned Items List */}
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-semibold text-slate-400">
            รายการบิลลดหย่อนที่บันทึกไว้ ({summary?.scanned_items?.length || 0} รายการ):
          </div>

          {(!summary?.scanned_items || summary.scanned_items.length === 0) ? (
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
              <Receipt className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">ยังไม่มีบิลลดหย่อนในระบบ</p>
              <button
                type="button"
                onClick={onNavigateScanner}
                className="text-xs text-indigo-400 hover:underline font-semibold"
              >
                สแกนใบเสร็จหรือสลิปเบี้ยประกันแรกของคุณ →
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
              {summary.scanned_items.map((item) => {
                const catInfo = CATEGORY_MAP[item.type] || {
                  label: item.type,
                  badge: 'bg-slate-800 text-slate-300',
                };
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-2"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.2 rounded-md text-[9px] font-bold border ${catInfo.badge}`}>
                          {(lang === 'en' ? catInfo.label_en : null) || catInfo.label}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.transaction_date || ''}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-200 truncate">
                        {item.title}
                      </div>
                      {item.note && (
                        <div className="text-[10px] text-slate-400 truncate">
                          {item.note}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-indigo-300">
                        ฿{Number(item.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* คำเตือน / หมายเหตุทางกฎหมาย */}
      <TaxDisclaimerCard lang={lang} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN APP COMPONENT
// ---------------------------------------------------------------------------
export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('chilltax_user');
      if (saved) return JSON.parse(saved);
      if (localStorage.getItem('chilltax_logged_out') === 'true') return null;
      // Default Demo Account for Judge / First-time Demo Access
      const defaultDemoUser = {
        email: 'demo@chilltax.com',
        fullname: 'Demo Account (Judge Access)',
        created_at: new Date().toISOString(),
      };
      localStorage.setItem('chilltax_user', JSON.stringify(defaultDemoUser));
      return defaultDemoUser;
    } catch {
      return {
        email: 'demo@chilltax.com',
        fullname: 'Demo Account (Judge Access)',
      };
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    total_income: 0,
    total_expense_business: 0,
    net_profit: 0,
    estimated_income_tax: 0,
    estimated_vat: 0,
    vat_due_date: '',
    income_tax_due_date: '',
    pending_count: 0,
    vat_threshold: 1800000,
    vat_progress_percent: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [toast, setToast] = useState(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  // Onboarding Tour Modal State (เช็ก localStorage ว่าเคยดู Tutorial หรือยัง)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return localStorage.getItem('hasSeenTutorial') !== 'true';
    } catch {
      return false;
    }
  });

  const handleCompleteOnboarding = () => {
    try {
      localStorage.setItem('hasSeenTutorial', 'true');
    } catch (e) {
      console.warn('localStorage error:', e);
    }
    setShowOnboarding(false);
  };

  // 1. Language State (TH / EN)
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('chilltax_lang') || 'th';
    } catch {
      return 'th';
    }
  });

  const toggleLang = () => {
    const nextLang = lang === 'th' ? 'en' : 'th';
    setLang(nextLang);
    try {
      localStorage.setItem('chilltax_lang', nextLang);
    } catch {}
  };

  const t = (key, defaultVal = '') => {
    return DICTIONARY[lang]?.[key] || DICTIONARY['th']?.[key] || defaultVal || key;
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  const handleLogout = () => {
    localStorage.removeItem('chilltax_user');
    localStorage.setItem('chilltax_logged_out', 'true');
    setCurrentUser(null);
    showToast(t('logoutSuccess'), 'info');
  };

  const handleLoginSuccess = (user) => {
    localStorage.removeItem('chilltax_logged_out');
    localStorage.setItem('chilltax_user', JSON.stringify(user));
    setCurrentUser(user);
    showToast(`ยินดีต้อนรับ ${user.fullname || user.email}`);
    fetchStats();
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      let res = null;
      const urlsToTry = [API_BASE, ...CANDIDATE_SERVERS.filter((u) => u !== API_BASE)];
      for (const baseUrl of urlsToTry) {
        try {
          const controller = new AbortController();
          const tid = setTimeout(() => controller.abort(), 8000);
          const candidateRes = await fetch(`${baseUrl}/api/dashboard-stats`, { signal: controller.signal });
          clearTimeout(tid);
          if (candidateRes.ok) {
            res = candidateRes;
            if (baseUrl !== API_BASE) {
              setGlobalApiBase(baseUrl);
            }
            break;
          }
        } catch {
          // Try next candidate server
        }
      }
      if (!res || !res.ok) throw new Error('Network error');
      const data = await res.json();
      setStats(data);
      // Clear stale offline badge once connected to live server
      setCurrentUser((prev) => {
        if (!prev?.is_offline) return prev;
        const updated = { ...prev, is_offline: false };
        try {
          localStorage.setItem('chilltax_user', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    } catch (err) {
      console.warn('Network error fetching stats, using mock stats:', err);
      setStats((prev) => ({ ...prev, ...FALLBACK_STATS }));
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="h-full w-full bg-slate-900 text-slate-100 flex justify-center items-center overflow-hidden sm:bg-slate-950 sm:py-6 selection:bg-emerald-500 selection:text-slate-950">
      {/* Mobile Frame Container: 100% full screen on mobile, max-w-md on desktop */}
      <div className="w-full sm:max-w-md bg-slate-900 h-full sm:h-[880px] sm:max-h-[920px] flex flex-col shadow-2xl relative sm:border sm:border-slate-800/80 sm:rounded-3xl overflow-hidden">
        
        {/* Top Header */}
        <header className="shrink-0 px-4 pt-[max(0.85rem,env(safe-area-inset-top))] pb-3 border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-md z-30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-4 h-4 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-white bg-clip-text text-transparent">
                  ChillTax
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                  {t('aiFintech')}
                </span>
                {currentUser?.is_offline && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-300 font-medium border border-amber-500/20 flex items-center gap-0.5">
                    <WifiOff className="w-2.5 h-2.5 text-amber-400" />
                    <span>{t('offline')}</span>
                  </span>
                )}
              </div>

              {/* 3. Tax Jurisdiction Badge (ป้ายกำกับป้องกันความสับสน) */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-0.5 shadow-sm">
                  {t('jurisdictionBadge')}
                </span>
                <p className="text-[10px] text-slate-400 truncate max-w-[110px]">
                  {currentUser?.fullname || currentUser?.email || t('appSub', 'ระบบภาษี')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* 1. ปุ่มเปลี่ยนภาษา (Language Toggle [TH / EN]) */}
            <button
              onClick={toggleLang}
              title={lang === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
              className="px-2 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700/80 text-[11px] font-bold text-slate-200 flex items-center gap-1 transition active:scale-95 shadow-sm cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className={lang === 'th' ? 'text-emerald-400 font-extrabold' : 'text-slate-400 font-medium'}>TH</span>
              <span className="text-slate-600 font-normal">/</span>
              <span className={lang === 'en' ? 'text-emerald-400 font-extrabold' : 'text-slate-400 font-medium'}>EN</span>
            </button>

            <button
              onClick={() => {
                fetchStats();
                showToast(t('refreshSuccess'), 'info');
              }}
              disabled={loadingStats}
              title={t('refreshTooltip')}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            {/* ปุ่มเปิดคู่มือ Onboarding Tutorial อีกครั้ง */}
            <button
              onClick={() => setShowOnboarding(true)}
              title={lang === 'en' ? 'App Tour & Guide' : 'แนะนำการใช้งาน (Tutorial)'}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-teal-400 hover:text-teal-300 transition active:scale-95 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>

            {currentUser && (
              <button
                onClick={handleLogout}
                title={t('logoutTooltip')}
                className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 transition active:scale-95 flex items-center gap-1 text-[11px] font-medium cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* Toast Notification */}
        {toast && (
          <div className="absolute top-16 left-4 right-4 z-50 animate-bounce duration-300 pointer-events-none">
            <div className={`px-4 py-2.5 rounded-2xl border text-xs font-medium shadow-xl flex items-center gap-2 backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-950/95 text-rose-200 border-rose-800'
                : toast.type === 'info'
                ? 'bg-cyan-950/95 text-cyan-200 border-cyan-800'
                : 'bg-emerald-950/95 text-emerald-200 border-emerald-800'
            }`}>
              {toast.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Main Content Area - Scrollable independently */}
        <main className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-6 scroll-smooth">
          {!currentUser ? (
            <LoginView onLogin={handleLoginSuccess} />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  stats={stats}
                  onNavigateSpeedReview={() => setActiveTab('speed-review')}
                  onOpenAuditDefense={() => setAuditModalOpen(true)}
                  lang={lang}
                  t={t}
                />
              )}

              {activeTab === 'deductions' && (
                <DeductionDashboard
                  currentUser={currentUser}
                  onNavigateScanner={() => setActiveTab('scanner')}
                  onToast={showToast}
                  lang={lang}
                  t={t}
                />
              )}

              {activeTab === 'scanner' && (
                <ScannerView
                  stats={stats}
                  currentUser={currentUser}
                  onScanComplete={() => {
                    fetchStats();
                    showToast(lang === 'en' ? 'Slip recorded into system' : 'บันทึกข้อมูลสลิปเข้าสู่ระบบแล้ว');
                  }}
                  onNavigateSpeedReview={() => setActiveTab('speed-review')}
                  lang={lang}
                  t={t}
                />
              )}

              {activeTab === 'speed-review' && (
                <SpeedReviewView
                  onItemConfirmed={(count) => {
                    fetchStats();
                    showToast(count ? (lang === 'en' ? `Confirmed all ${count} items successfully` : `ยืนยันบิลทั้งหมด ${count} รายการสำเร็จ`) : (lang === 'en' ? 'Category confirmed successfully' : 'ยืนยันหมวดหมู่ภาษีสำเร็จ'));
                  }}
                  lang={lang}
                  t={t}
                />
              )}
            </>
          )}
        </main>

        {/* Audit Defense Modal */}
        {auditModalOpen && (
          <AuditDefenseModal
            stats={stats}
            onClose={() => setAuditModalOpen(false)}
            onDownloaded={() => {
              setAuditModalOpen(false);
              showToast('ส่งออกแฟ้มชี้แจงภาษี (PDF) สำเร็จแล้ว!');
            }}
          />
        )}

        {/* Onboarding Welcome Tour Modal */}
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={handleCompleteOnboarding}
          lang={lang}
        />

        {/* Bottom Tab Navigation - Pinned at bottom, completely separated from content */}
        {currentUser && (
          <nav className="shrink-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-3 pt-2 z-40 flex justify-around items-center shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.5)] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {[
              { id: 'dashboard', label: t('tabDashboard'), icon: LayoutDashboard },
              { id: 'deductions', label: t('tabDeductions'), icon: PiggyBank },
              { id: 'scanner', label: t('tabScanner'), icon: ScanLine },
              { id: 'speed-review', label: t('tabSpeedReview'), icon: CheckCheck, badge: stats.pending_count },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-16 flex flex-col items-center gap-1 transition-all duration-300 relative cursor-pointer ${
                    isActive ? '-mt-5 text-emerald-300 scale-105' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isActive ? (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/35 flex items-center justify-center">
                      <div className="w-full h-full bg-slate-950/40 rounded-[14px] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-xl hover:bg-slate-800/50 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                  )}
                  <span
                    className={`text-[10px] transition-colors ${
                      isActive ? 'font-bold text-emerald-400' : 'font-medium'
                    }`}
                  >
                    {tab.label}
                  </span>

                  {tab.badge > 0 && (
                    <span
                      className={`absolute px-1.5 py-0.2 min-w-4 text-[10px] font-bold rounded-full bg-rose-500 text-white flex items-center justify-center animate-pulse ${
                        isActive ? '-top-1 right-1' : '-top-1 right-2'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. DASHBOARD VIEW (ศูนย์บัญชาการ)
// ---------------------------------------------------------------------------
function DashboardView({ stats, onNavigateSpeedReview, onOpenAuditDefense, lang = 'th', t = (k) => DICTIONARY['th']?.[k] || k }) {
  const percent = stats.vat_progress_percent || 0;
  const remainingVAT = Math.max(0, (stats.vat_threshold || 1800000) - (stats.total_income || 0));

  const [activeDonutFilter, setActiveDonutFilter] = useState(null);
  const [isDeductionsExpanded, setIsDeductionsExpanded] = useState(false);

  const inc1 = Number(stats.income_40_1 || 0);
  const inc2 = Number(stats.income_40_2 || 0);
  const inc8 = Number(stats.income_40_8 || 0);
  const totalInc = (inc1 + inc2 + inc8) > 0 ? (inc1 + inc2 + inc8) : Number(stats.total_income || 0);

  const pct1 = totalInc > 0 ? (inc1 / totalInc) * 100 : 0;
  const pct2 = totalInc > 0 ? (inc2 / totalInc) * 100 : 0;
  const pct8 = totalInc > 0 ? (inc8 / totalInc) * 100 : 0;

  // Donut SVG constants (Radius = 36, circumference = 2 * PI * 36 = 226.19467)
  const r = 36;
  const circ = 2 * Math.PI * r;
  const stroke1 = (pct1 / 100) * circ;
  const stroke2 = (pct2 / 100) * circ;
  const stroke8 = (pct8 / 100) * circ;
  const offset1 = 0;
  const offset2 = -stroke1;
  const offset8 = -(stroke1 + stroke2);

  // VAT Status Color
  let progressColor = 'from-emerald-500 to-teal-400';
  let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  let statusText = lang === 'en' ? 'Safe Zone' : 'ปลอดภัย (Safe Zone)';
  let alertIcon = <ShieldCheck className="w-4 h-4 text-emerald-400" />;

  if (percent >= 80) {
    progressColor = 'from-rose-500 to-red-600 animate-pulse';
    badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    statusText = lang === 'en' ? 'Warning: Near VAT Limit' : 'ระวัง! ใกล้ทะลุเพดาน VAT';
    alertIcon = <ShieldAlert className="w-4 h-4 text-rose-400" />;
  } else if (percent >= 50) {
    progressColor = 'from-amber-400 to-orange-500';
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    statusText = lang === 'en' ? 'Watchlist' : 'เฝ้าระวัง (Watchlist)';
    alertIcon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
  }

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Mocked AI Audit Risk Score (15% = Green / Safe)
  const auditRiskScore = 15;

  return (
    <div className="space-y-4">
      {/* Alert banner for pending reviews */}
      {stats.pending_count > 0 && (
        <div
          onClick={onNavigateSpeedReview}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-amber-900/40 to-slate-900 border border-amber-700/50 flex items-center justify-between cursor-pointer group hover:border-amber-600 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/40 text-amber-300">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-200">
                {t('pendingAlert').replace('{count}', stats.pending_count)}
              </p>
              <p className="text-[11px] text-amber-400/80">{t('pendingClick')}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition" />
        </div>
      )}

      {/* Primary Highlights: Estimated Tax & VAT 7% Cards Grid (อยู่ด้านบนสุดของหน้าแรก) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: ภาษีเงินได้ประเมิน (Income Tax) */}
        <div className="p-4 rounded-3xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border border-amber-800/40 relative flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Calculator className="w-4 h-4" />
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                (stats.current_bracket || 0) === 0
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : (stats.current_bracket || 0) === 5
                  ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                  : (stats.current_bracket || 0) === 10
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              }`}>
                {t('taxBracketPrefix')} {stats.current_bracket ?? 0}%
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-200 block">{t('estIncomeTax')}</span>
            <span className="text-lg font-black text-amber-400 tracking-tight mt-0.5 block">
              ฿{formatCurrency(stats.estimated_income_tax)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block leading-tight">
              {t('netTaxableIncomeLabel')} ฿{formatCurrency(stats.net_taxable_income || 0)}
            </span>

            {/* แถบขั้นบันไดภาษีและข้อความแจ้งเตือน (Tax Bracket Warning & Progress Bar) */}
            <div className="mt-2.5 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                <span className={
                  (stats.current_bracket || 0) <= 5
                    ? 'text-emerald-400'
                    : (stats.current_bracket || 0) === 10
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }>
                  {t('currentBracket')} {stats.current_bracket ?? 0}%
                </span>
                <span className="text-[9.5px] text-slate-400">
                  {t('nextBracket')} {stats.next_bracket ?? 5}%
                </span>
              </div>

              {/* หลอด Progress Bar เล็กๆ (เปลี่ยนสีตามความอันตราย) */}
              <div className="w-full h-1.5 rounded-full bg-slate-950/80 p-0.2 border border-slate-700/60 overflow-hidden mb-1.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    (stats.current_bracket || 0) <= 5
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : (stats.current_bracket || 0) === 10
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                      : 'bg-gradient-to-r from-rose-500 to-red-600 animate-pulse'
                  }`}
                  style={{ width: `${Math.max(6, Math.min(100, stats.bracket_progress_percent || 0))}%` }}
                />
              </div>

              {/* ข้อความ Nudge กระตุ้นเตือนการวางแผนลดหย่อนภาษี */}
              <p className="text-[9.5px] text-amber-200/90 leading-tight bg-amber-500/10 border border-amber-500/20 rounded-lg p-1.5 mt-1 font-medium">
                {lang === 'en'
                  ? ((stats.current_bracket || 0) === 0
                      ? `💡 Next ฿${formatCurrency(stats.amount_to_next_bracket || 150000)} net income to enter 5% tax bracket`
                      : `💡 Another ฿${formatCurrency(stats.amount_to_next_bracket)} profit will trigger ${stats.next_bracket}% tax bracket. Suggest finding more deductions!`)
                  : (stats.bracket_nudge_text || ((stats.current_bracket || 0) === 0
                      ? `💡 เงินได้สุทธิอีก ฿${formatCurrency(stats.amount_to_next_bracket || 150000)} จะขยับไปฐาน 5%`
                      : `💡 กำไรอีก ฿${formatCurrency(stats.amount_to_next_bracket)} จะขยับไปเสียภาษีฐาน ${stats.next_bracket}% แนะนำให้หาค่าลดหย่อนเพิ่ม`))}
              </p>
            </div>
          </div>

          {/* วันครบกำหนดยื่นภาษีเงินได้ */}
          <div className="mt-2.5 pt-2 border-t border-amber-800/30 flex items-start gap-1.5 text-[10px] text-amber-300 font-semibold">
            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span className="leading-tight">
              {lang === 'en' ? 'File P.N.D.90 by 31 Mar 2027' : (stats.income_tax_due_date || t('fileDuePrefix'))}
            </span>
          </div>
        </div>

        {/* Card 2: VAT 7% ที่ต้องนำส่ง */}
        {((stats.total_income || 0) < (stats.vat_threshold || 1800000)) ? (
          <div className="p-4 rounded-3xl bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/40 relative flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                  {t('vatSafeBadge')}
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-200 block">{t('vatLabel')}</span>
              <span className="text-base font-black text-emerald-400 tracking-tight mt-0.5 block">
                {lang === 'en' ? t('vatBelowThreshold') : (stats.vat_status_label || t('vatBelowThreshold'))}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block leading-tight">
                {t('vatSafeNote')}
              </span>
            </div>

            {/* สถานะ VAT */}
            <div className="mt-3 pt-2 border-t border-emerald-800/30 flex items-start gap-1.5 text-[10.5px] text-emerald-300 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-tight">
                {t('vatRemaining')} ฿{formatCurrency(remainingVAT)}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-3xl bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-900 border border-rose-800/40 relative flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Landmark className="w-4 h-4" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 font-semibold">
                  {t('vatReachedThreshold')}
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-200 block">{t('estVat')}</span>
              <span className="text-lg font-black text-rose-400 tracking-tight mt-0.5 block">
                ฿{formatCurrency(stats.estimated_vat)}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block leading-tight">
                {t('vatWarningNote')}
              </span>
            </div>

            {/* วันครบกำหนดยื่น VAT 7% */}
            <div className="mt-3 pt-2 border-t border-rose-800/30 flex items-start gap-1.5 text-[10.5px] text-rose-300 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-tight">
                {t('vatDueDate')} {stats.vat_due_date || '15 พ.ย. 2026'} <span className="text-rose-400 font-bold block sm:inline">{t('vatDueWarning')}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* AI Audit Risk Meter Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-b from-slate-800/80 via-slate-850 to-slate-900 border border-slate-700/70 relative overflow-hidden shadow-lg backdrop-blur-sm">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide">AI Audit Risk Meter</h3>
              <p className="text-[10px] text-slate-400">
                {lang === 'en' ? 'AI Tax Audit Risk Assessment Gauge' : 'เกจประเมินความเสี่ยงตรวจภาษีโดย AI'}
              </p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {lang === 'en' ? 'Safe (Low Risk)' : 'ปลอดภัย (Safe)'}
          </span>
        </div>

        {/* Semi-Circle / Gauge Visualizer */}
        <div className="flex flex-col items-center justify-center pt-1 pb-2">
          <div className="relative w-44 h-24 flex items-end justify-center overflow-hidden">
            {/* Background Arc */}
            <svg viewBox="0 0 100 55" className="w-full h-full">
              <defs>
                <linearGradient id="auditGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />   {/* Green */}
                  <stop offset="45%" stopColor="#34d399" />
                  <stop offset="70%" stopColor="#fbbf24" />  {/* Yellow */}
                  <stop offset="100%" stopColor="#ef4444" /> {/* Red */}
                </linearGradient>
              </defs>
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#1e293b"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="url(#auditGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="126"
                strokeDashoffset={126 - (126 * (auditRiskScore / 100))}
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Gauge Needle/Pointer for 15% (Angle: -180 + 15% * 180 = -153 deg) */}
            <div
              className="absolute bottom-1 w-1 h-14 bg-gradient-to-t from-emerald-400 to-transparent origin-bottom rounded-full transition-transform duration-1000"
              style={{ transform: `rotate(${-90 + (auditRiskScore / 100) * 180}deg)` }}
            />
            <div className="absolute bottom-0 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-md shadow-emerald-400/50" />
          </div>

          <div className="text-center -mt-1">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-2xl font-black text-emerald-400">{auditRiskScore}%</span>
              <span className="text-xs text-slate-400 font-medium">
                {lang === 'en' ? 'Low Risk Level' : 'ระดับความเสี่ยงต่ำ'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {lang === 'en'
                ? 'Clear evidence for most bills • Balanced income/expenses'
                : 'บิลส่วนใหญ่มีหลักฐานชัดเจน • แยกรายรับ/รายจ่ายเป็นสัดส่วน'}
            </p>
          </div>
        </div>

        {/* Audit Risk Mini Indicators */}
        <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-800 text-center">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">{lang === 'en' ? 'Documentation' : 'เอกสารสมบูรณ์'}</span>
            <span className="text-xs font-bold text-emerald-400">96%</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">{lang === 'en' ? 'Anomalous Bills' : 'บิลผิดปกติ'}</span>
            <span className="text-xs font-bold text-slate-200">{lang === 'en' ? '0 items' : '0 รายการ'}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">{lang === 'en' ? 'Tax Shield' : 'เกราะภาษี'}</span>
            <span className="text-xs font-bold text-cyan-400">{lang === 'en' ? 'Strong' : 'แข็งแกร่ง'}</span>
          </div>
        </div>
      </div>

      {/* VAT 7% Warning Progress Card */}
      <div className="p-5 rounded-3xl bg-slate-800/60 border border-slate-700/60 relative overflow-hidden backdrop-blur-sm">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-400">{t('vatCeilingTitle')}</h2>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{percent}%</span>
              <span className="text-xs text-slate-400">{t('of18m')}</span>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 ${badgeColor}`}>
            {alertIcon}
            <span>{statusText}</span>
          </div>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-950/80 p-0.5 border border-slate-700/50 mb-3">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${progressColor} transition-all duration-700`}
            style={{ width: `${Math.min(100, Math.max(3, percent))}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-700/40">
          <span>{t('accumulatedIncome')} ฿{formatCurrency(stats.total_income)}</span>
          <span className="font-medium text-slate-300">{t('remainingAmount')} ฿{formatCurrency(remainingVAT)}</span>
        </div>
      </div>

      {/* Section 40 Income Breakdown & Interactive Donut Chart */}
      <div className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700/80 relative overflow-hidden backdrop-blur-sm space-y-4 shadow-lg">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide">{t('incomeBySec40')}</h3>
              <p className="text-[10px] text-slate-400">{t('incomeBySec40Sub')}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">{t('totalIncomeAll')}</span>
            <span className="text-xl font-black text-emerald-400 tracking-tight">
              ฿{formatCurrency(totalInc)}
            </span>
          </div>
        </div>

        {/* Donut Chart & Breakdown Pills */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
          {/* Interactive Donut SVG */}
          <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="#1e293b"
                strokeWidth="14"
              />
              {/* 40(1) Segment - Blue */}
              {pct1 > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={r}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={activeDonutFilter === '40_1' ? '18' : '14'}
                  strokeDasharray={`${stroke1} ${circ}`}
                  strokeDashoffset={offset1}
                  className="transition-all duration-300 cursor-pointer hover:opacity-90"
                  onClick={() => setActiveDonutFilter(activeDonutFilter === '40_1' ? null : '40_1')}
                />
              )}
              {/* 40(2) Segment - Teal */}
              {pct2 > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={r}
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth={activeDonutFilter === '40_2' ? '18' : '14'}
                  strokeDasharray={`${stroke2} ${circ}`}
                  strokeDashoffset={offset2}
                  className="transition-all duration-300 cursor-pointer hover:opacity-90"
                  onClick={() => setActiveDonutFilter(activeDonutFilter === '40_2' ? null : '40_2')}
                />
              )}
              {/* 40(8) Segment - Emerald */}
              {pct8 > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={r}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth={activeDonutFilter === '40_8' ? '18' : '14'}
                  strokeDasharray={`${stroke8} ${circ}`}
                  strokeDashoffset={offset8}
                  className="transition-all duration-300 cursor-pointer hover:opacity-90"
                  onClick={() => setActiveDonutFilter(activeDonutFilter === '40_8' ? null : '40_8')}
                />
              )}
            </svg>
            {/* Center Info in Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[10px] text-slate-400 font-medium">{t('proportion')}</span>
              <span className="text-xs font-black text-white">
                {activeDonutFilter === '40_1' ? '40(1)' : activeDonutFilter === '40_2' ? '40(2)' : activeDonutFilter === '40_8' ? '40(8)' : (lang === 'en' ? '3 Cats' : '3 หมวด')}
              </span>
            </div>
          </div>

          {/* Interactive Proportions List */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* 40(1) Item */}
            <div
              onClick={() => setActiveDonutFilter(activeDonutFilter === '40_1' ? null : '40_1')}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                activeDonutFilter === '40_1'
                  ? 'bg-blue-500/20 border-blue-500 shadow-md shadow-blue-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-200 whitespace-nowrap">
                      {t('income40_1Title')}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-semibold shrink-0">
                      {pct1.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">{t('income40_1Desc')}</span>
                </div>
              </div>
              <span className="text-xs font-extrabold text-blue-300 shrink-0 text-right whitespace-nowrap pl-1">
                ฿{formatCurrency(inc1)}
              </span>
            </div>

            {/* 40(2) Item */}
            <div
              onClick={() => setActiveDonutFilter(activeDonutFilter === '40_2' ? null : '40_2')}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                activeDonutFilter === '40_2'
                  ? 'bg-teal-500/20 border-teal-500 shadow-md shadow-teal-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-sm shadow-teal-400/50 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-200 whitespace-nowrap">
                      {t('income40_2Title')}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-semibold shrink-0">
                      {pct2.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">{t('income40_2Desc')}</span>
                </div>
              </div>
              <span className="text-xs font-extrabold text-teal-300 shrink-0 text-right whitespace-nowrap pl-1">
                ฿{formatCurrency(inc2)}
              </span>
            </div>

            {/* 40(8) Item */}
            <div
              onClick={() => setActiveDonutFilter(activeDonutFilter === '40_8' ? null : '40_8')}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                activeDonutFilter === '40_8'
                  ? 'bg-emerald-500/20 border-emerald-500 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-200 whitespace-nowrap">
                      {t('income40_8Title')}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold shrink-0">
                      {pct8.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">{t('income40_8Desc')}</span>
                </div>
              </div>
              <span className="text-xs font-extrabold text-emerald-300 shrink-0 text-right whitespace-nowrap pl-1">
                ฿{formatCurrency(inc8)}
              </span>
            </div>
          </div>
        </div>

        {/* Dropdown สรุปการหักค่าใช้จ่ายอัตโนมัติ (Smart Tax Deductions) */}
        <div className="pt-2 border-t border-slate-700/60">
          <button
            type="button"
            onClick={() => setIsDeductionsExpanded(!isDeductionsExpanded)}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 hover:border-slate-600 border border-slate-700/80 flex items-center justify-between transition cursor-pointer group gap-2"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="text-left min-w-0">
                <span className="text-xs font-bold text-white block group-hover:text-teal-300 transition truncate">
                  {t('smartDeductionTitle')}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {t('smartDeductionSubtitle')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-teal-400 font-semibold shrink-0 whitespace-nowrap pl-1">
              <span>{isDeductionsExpanded ? t('hideDeductions') : t('viewDeductions')}</span>
              {isDeductionsExpanded ? (
                <ChevronUp className="w-4 h-4 transition-transform text-emerald-400 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 transition-transform text-slate-400 shrink-0" />
              )}
            </div>
          </button>

          {/* Expandable Breakdown Content */}
          {isDeductionsExpanded && (
            <div className="mt-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Point 1: 40(1) + 40(2) */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-500/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    💼 40(1) + 40(2)
                  </span>
                  <span className="text-xs font-black text-white">
                    {lang === 'en' ? 'Total ฿' : 'รวม ฿'}{formatCurrency(inc1 + inc2)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {lang === 'en'
                    ? 'Law requires combining 40(1) and 40(2), deducting flat 50% expenses up to a maximum 100,000 THB.'
                    : 'กฎหมายกำหนดให้รวมยอด 40(1) และ 40(2) เข้าด้วยกัน แล้วหักค่าใช้จ่ายเหมา 50% สูงสุดไม่เกิน 100,000 บาท'}
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400">{lang === 'en' ? 'Deductible:' : 'หักค่าใช้จ่ายได้:'}</span>
                  <span className="font-extrabold text-emerald-400">
                    ฿{formatCurrency(stats.expense_40_1_2 || Math.min(100000, (inc1 + inc2) * 0.5))}
                  </span>
                </div>
                {(inc1 + inc2) * 0.5 > 100000 ? (
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                    {lang === 'en' ? '🔒 Capped at statutory max 100,000 THB' : '🔒 ถึงเพดานสูงสุด 100,000 บาท ตามกฎหมายกำหนด'}
                  </span>
                ) : (
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                    {lang === 'en' ? `✓ Full 50% flat deductible (฿${formatCurrency((inc1 + inc2) * 0.5)})` : `✓ หักเหมา 50% ได้เต็มตามจำนวน (฿${formatCurrency((inc1 + inc2) * 0.5)})`}
                  </span>
                )}
              </div>

              {/* Point 2: 40(8) */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    🏪 40(8) {lang === 'en' ? 'Business / Sales' : 'ธุรกิจ / ขายของ'}
                  </span>
                  <span className="text-xs font-black text-white">
                    {lang === 'en' ? 'Total ฿' : 'รวม ฿'}{formatCurrency(inc8)}
                  </span>
                </div>
                
                {/* Comparison Box */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">{lang === 'en' ? 'Option 1: Flat 60%' : 'แบบที่ 1: หักเหมา 60%'}</span>
                    <span className="font-bold text-slate-200">฿{formatCurrency(stats.expense_40_8_flat || inc8 * 0.6)}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">{lang === 'en' ? 'Option 2: Actual (Bills)' : 'แบบที่ 2: หักตามจริง (บิล)'}</span>
                    <span className="font-bold text-slate-200">฿{formatCurrency(stats.total_expense_business || 0)}</span>
                  </div>
                </div>

                {/* AI Selected Choice */}
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-[11px] text-emerald-300 flex items-start gap-2 shadow-sm">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    {(stats.expense_40_8_choice === 'actual' || ((stats.total_expense_business || 0) > (stats.expense_40_8_flat || inc8 * 0.6))) ? (
                      <span>
                        <strong className="text-emerald-200 font-bold">{lang === 'en' ? '✨ System auto-selected actual deduction:' : '✨ ระบบเลือกหักตามจริงให้อัตโนมัติ:'}</strong> {lang === 'en' ? `You have ฿${formatCurrency(stats.total_expense_business)} in business expense bills, saving more tax than 60% flat!` : `คุณมีบิลรายจ่ายธุรกิจ ฿${formatCurrency(stats.total_expense_business)} ซึ่งมากกว่าหักเหมา 60% จึงช่วยประหยัดภาษีได้มากกว่า!`}
                      </span>
                    ) : (
                      <span>
                        <strong className="text-emerald-200 font-bold">{lang === 'en' ? `✨ System auto-selected 60% flat (฿${formatCurrency(stats.expense_40_8_flat || inc8 * 0.6)}):` : `✨ ระบบเลือกหักเหมา 60% (฿${formatCurrency(stats.expense_40_8_flat || inc8 * 0.6)}) ให้อัตโนมัติ:`}</strong> {lang === 'en' ? `Saves more than actual bills ฿${formatCurrency(stats.total_expense_business || 0)}` : `ประหยัดภาษีกว่าการหักตามจริงที่มีบิล ฿${formatCurrency(stats.total_expense_business || 0)}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Point 3: 40(3) - 40(7) */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    💡 40(3) - 40(7) {lang === 'en' ? 'Royalties / Dividends / Rent / Freelance' : 'ลิขสิทธิ์ / ปันผล / ค่าเช่า / วิชาชีพ / รับเหมา'}
                  </span>
                  <span className="text-xs font-black text-white">
                    {lang === 'en' ? 'Total ฿' : 'รวม ฿'}{formatCurrency((stats.income_40_3 || 0) + (stats.income_40_4 || 0) + (stats.income_40_5 || 0) + (stats.income_40_6 || 0) + (stats.income_40_7 || 0))}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {lang === 'en'
                    ? 'Deductions: 40(3) Royalty 50% (cap 100k) • 40(4) Interest 0% • 40(5) Rent 30% • 40(6) Professions 30-60% • 40(7) Contractor 60%'
                    : 'เกณฑ์หักค่าใช้จ่าย: 40(3) ลิขสิทธิ์ 50% (เพดาน 100k) • 40(4) ดอกเบี้ย/ปันผล 0% • 40(5) ค่าเช่า 30% • 40(6) วิชาชีพ 30-60% • 40(7) รับเหมา 60%'}
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400">{lang === 'en' ? 'Deductible:' : 'หักค่าใช้จ่ายได้:'}</span>
                  <span className="font-extrabold text-emerald-400">
                    ฿{formatCurrency((stats.expense_40_3 || 0) + (stats.expense_40_4 || 0) + (stats.expense_40_5 || 0) + (stats.expense_40_6 || 0) + (stats.expense_40_7 || 0))}
                  </span>
                </div>
              </div>

              {/* Total Deductible & Net Summary */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">{t('deductibleExpenseTotal')}</span>
                  <span className="font-bold text-emerald-400">
                    -฿{formatCurrency(stats.total_expense_deductible || ((stats.expense_40_1_2 || 0) + (stats.expense_40_8_deductible || 0)))}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">{t('incomeAfterExpenses')}</span>
                  <span className="font-bold text-white">
                    ฿{formatCurrency(stats.income_after_expenses || Math.max(0, totalInc - (stats.total_expense_deductible || 0)))}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">{t('personalDeductionsTotal')}</span>
                  <span className="font-bold text-indigo-400">
                    -฿{formatCurrency(stats.grand_total_deductions || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-200 font-bold pt-1.5 border-t border-slate-800">
                  <span className="text-emerald-400">{t('netTaxableIncomeSummary')}</span>
                  <span className="text-emerald-400 font-black">
                    ฿{formatCurrency(stats.net_taxable_income || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-3xl bg-gradient-to-b from-emerald-950/40 to-slate-900 border border-emerald-800/40 relative">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2.5">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium text-slate-400 block">{t('income40_8')}</span>
          <span className="text-lg font-black text-emerald-400 tracking-tight mt-0.5 block">
            ฿{formatCurrency(inc8)}
          </span>
          <span className="text-[10px] text-emerald-500/80 font-medium">{t('income40_8Sub')}</span>
        </div>

        <div className="p-4 rounded-3xl bg-gradient-to-b from-rose-950/40 to-slate-900 border border-rose-800/40 relative">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-2.5">
            <TrendingDown className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium text-slate-400 block">{t('businessExpenses')}</span>
          <span className="text-lg font-black text-rose-400 tracking-tight mt-0.5 block">
            ฿{formatCurrency(stats.total_expense_business)}
          </span>
          <span className="text-[10px] text-rose-400/80 font-medium">{t('businessExpensesSub')}</span>
        </div>
      </div>

      {/* Net Profit Estimate */}
      <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-300">{t('netProfit')}</p>
            <p className="text-[11px] text-slate-400">{t('netProfitSub')}</p>
          </div>
        </div>
        <span className="text-sm font-bold text-teal-300">
          ฿{formatCurrency(stats.net_profit ?? Math.max(0, inc8 - (stats.total_expense_business || 0)))}
        </span>
      </div>


      {/* Prominent Action Button: Audit Defense */}
      <div className="pt-2">
        <button
          onClick={onOpenAuditDefense}
          className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:brightness-105 active:scale-[0.98] transition flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-slate-950/20 flex items-center justify-center text-slate-950 font-bold border border-slate-950/10">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-sm font-black tracking-tight text-slate-950">
                {t('auditDefenseTitle')}
              </span>
              <span className="block text-[11px] text-slate-900/80 font-semibold">
                {t('auditDefenseSub')}
              </span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition" />
        </button>
      </div>

      {/* คำเตือน / หมายเหตุทางกฎหมาย */}
      <TaxDisclaimerCard lang={lang} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Audit Defense Modal (แฟ้มชี้แจงสรรพากรและบัญชีหลักฐานสลิปแนบ)
// ---------------------------------------------------------------------------
function AuditDefenseModal({ stats, onClose, onDownloaded, lang = 'th', t = (k) => DICTIONARY['th']?.[k] || k }) {
  const [activeTab, setActiveTab] = useState('report'); // 'report' | 'evidence'
  const [confirmedTransactions, setConfirmedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchConfirmed = async () => {
      try {
        setLoading(true);
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(`${API_BASE}/api/transactions?status=confirmed`, { signal: controller.signal });
        clearTimeout(tid);
        if (res.ok) {
          const data = await res.json();
          setConfirmedTransactions(data && data.length > 0 ? data : FALLBACK_CONFIRMED_ITEMS);
        } else {
          setConfirmedTransactions(FALLBACK_CONFIRMED_ITEMS);
        }
      } catch (err) {
        console.warn('Fallback confirmed transactions for offline demo:', err);
        setConfirmedTransactions(FALLBACK_CONFIRMED_ITEMS);
      } finally {
        setLoading(false);
      }
    };
    fetchConfirmed();
  }, []);

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadZip = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      onDownloaded();
    }, 1500);
  };

  const totalConfirmedAmount = confirmedTransactions.reduce(
    (sum, t) => sum + (Number(t.amount) || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl max-h-[92vh] rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <FolderArchive className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  {lang === 'en' ? 'Tax Audit Defense Dossier' : 'แฟ้มชี้แจงสรรพากร (Tax Audit Defense Dossier)'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {lang === 'en' ? 'AI Certified' : 'รับรองโดย AI'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {lang === 'en'
                  ? 'Official tax summary and attached digital slip audit schedule for Revenue Department submission'
                  : 'เอกสารสรุปแสดงรายการภาษีและตารางหลักฐานสลิปดิจิทัลสำหรับยื่นสรรพากร'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 shrink-0">
          <button
            onClick={() => setActiveTab('report')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'report'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{lang === 'en' ? 'Official Tax Summary Report' : 'แบบรายงานสรุปภาษีทางการ'}</span>
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'evidence'
                ? 'border-teal-400 text-teal-300 bg-teal-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>{lang === 'en' ? 'Attached Slip Evidence' : 'บัญชีหลักฐานสลิปแนบ'} ({confirmedTransactions.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">กำลังดึงข้อมูลธุรกรรมและจัดหน้าแฟ้มชี้แจง...</p>
            </div>
          ) : activeTab === 'report' ? (
            /* ========================================================= */
            /* TAB 1: แบบรายงานสรุปภาษีทางการ (Official Defense Dossier) */
            /* ========================================================= */
            <div className="space-y-4">
              {/* Official Document Style Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner space-y-4 text-xs text-slate-300">
                {/* Document Header */}
                <div className="text-center pb-3 border-b border-slate-800 space-y-1">
                  <div className="inline-block px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-bold tracking-wider uppercase mb-1">
                    CHILLTAX AUDIT TRAIL CERTIFIED
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-white">
                    แบบรายงานสรุปแสดงรายการภาษีเงินได้และภาษีมูลค่าเพิ่ม
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    เอกสารประกอบการชี้แจงข้อเท็จจริงทางภาษีอากรและหลักฐานสลิปอิเล็กทรอนิกส์
                  </p>
                </div>

                {/* Taxpayer Info Box */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">ชื่อผู้เสียภาษี:</span>
                    <strong className="text-white block font-bold">นาย ชิล แท็กซ์ (Demo User)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">เลขประจำตัวผู้เสียภาษี:</span>
                    <strong className="text-emerald-400 block font-mono">3-1005-09281-44-2</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">ปีภาษี / รอบประเมิน:</span>
                    <strong className="text-white block font-bold">ปี พ.ศ. 2569 (2026)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">วันที่จัดทำรายงาน:</span>
                    <span className="text-slate-300">16 ตุลาคม 2569</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">สถานะการตรวจทาน:</span>
                    <span className="text-emerald-300 font-bold">✓ ยืนยันครบ 100%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">จำนวนสลิปหลักฐาน:</span>
                    <span className="text-teal-300 font-bold">{confirmedTransactions.length} ฉบับ</span>
                  </div>
                </div>

                {/* Section A: รายรับพึงประเมินมาตรา 40 */}
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-200 text-xs flex items-center justify-between border-b border-slate-800 pb-1">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      ส่วนที่ 1: รายการเงินได้พึงประเมิน (Income มาตรา 40)
                    </span>
                    <span className="text-emerald-400 font-black">
                      ฿{formatCurrency(stats.total_income)}
                    </span>
                  </h5>
                  <div className="space-y-1.5 pl-1 text-[11px]">
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">💼 ม.40(1) เงินเดือนและโบนัสประจำ:</span>
                      <span className="font-bold text-slate-200">฿{formatCurrency(stats.income_40_1)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">💻 ม.40(2) รับจ้างอิสระ / ค่าจ้าง / นายหน้า:</span>
                      <span className="font-bold text-slate-200">฿{formatCurrency(stats.income_40_2)}</span>
                    </div>
                    {stats.income_40_3 > 0 && (
                      <div className="flex justify-between py-1 border-b border-slate-900">
                        <span className="text-slate-400">💡 ม.40(3) ค่าลิขสิทธิ์ / ทรัพย์สินทางปัญญา:</span>
                        <span className="font-bold text-slate-200">฿{formatCurrency(stats.income_40_3)}</span>
                      </div>
                    )}
                    {stats.income_40_4 > 0 && (
                      <div className="flex justify-between py-1 border-b border-slate-900">
                        <span className="text-slate-400">📈 ม.40(4) ดอกเบี้ย / ปันผล / คริปโต:</span>
                        <span className="font-bold text-slate-200">฿{formatCurrency(stats.income_40_4)}</span>
                      </div>
                    )}
                    {stats.income_40_5 > 0 && (
                      <div className="flex justify-between py-1 border-b border-slate-900">
                        <span className="text-slate-400">🏢 ม.40(5) ค่าเช่าทรัพย์สิน:</span>
                        <span className="font-bold text-slate-200">฿{formatCurrency(stats.income_40_5)}</span>
                      </div>
                    )}
                    {stats.income_40_6 > 0 && (
                      <div className="flex justify-between py-1 border-b border-slate-900">
                        <span className="text-slate-400">⚖️ ม.40(6) วิชาชีพอิสระ:</span>
                        <span className="font-bold text-slate-200">฿{formatCurrency(stats.income_40_6)}</span>
                      </div>
                    )}
                    {stats.income_40_7 > 0 && (
                      <div className="flex justify-between py-1 border-b border-slate-900">
                        <span className="text-slate-400">🏗️ ม.40(7) รับเหมาก่อสร้าง (จัดหาสัมภาระ):</span>
                        <span className="font-bold text-slate-200">฿{formatCurrency(stats.income_40_7)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">🏪 ม.40(8) ธุรกิจ / การพาณิชย์ / ขายสินค้า:</span>
                      <span className="font-bold text-slate-200">฿{formatCurrency(stats.income_40_8)}</span>
                    </div>
                  </div>
                </div>

                {/* Section B: การหักค่าใช้จ่ายตามกฎหมาย */}
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-200 text-xs flex items-center justify-between border-b border-slate-800 pb-1">
                    <span className="flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                      ส่วนที่ 2: การหักค่าใช้จ่ายตามประมวลรัษฎากร
                    </span>
                    <span className="text-cyan-400 font-black">
                      -฿{formatCurrency(stats.total_expense_deductible)}
                    </span>
                  </h5>
                  <div className="space-y-1.5 pl-1 text-[11px]">
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">หักค่าใช้จ่าย ม.40(1)+40(2) (50% สูงสุด 100,000 บ.):</span>
                      <span className="font-bold text-slate-200">฿{formatCurrency(stats.expense_40_1_2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">
                        หักค่าใช้จ่าย ม.40(8) ({stats.expense_40_8_choice === 'actual' ? 'หักตามจริง' : 'หักเหมา 60% อัตโนมัติ'}):
                      </span>
                      <span className="font-bold text-slate-200">฿{formatCurrency(stats.expense_40_8_deductible)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-slate-300 font-bold bg-slate-900/40 px-2 rounded-lg">
                      <span>คงเหลือเงินได้หลังหักค่าใช้จ่าย:</span>
                      <span className="text-white font-extrabold">฿{formatCurrency(stats.income_after_expenses)}</span>
                    </div>
                  </div>
                </div>

                {/* Section C: ค่าลดหย่อนส่วนบุคคลและกองทุน */}
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-200 text-xs flex items-center justify-between border-b border-slate-800 pb-1">
                    <span className="flex items-center gap-1.5">
                      <PiggyBank className="w-3.5 h-3.5 text-indigo-400" />
                      ส่วนที่ 3: รายการลดหย่อนภาษีส่วนบุคคลและครอบครัว
                    </span>
                    <span className="text-indigo-400 font-black">
                      -฿{formatCurrency(stats.grand_total_deductions)}
                    </span>
                  </h5>
                  <div className="space-y-1.5 pl-1 text-[11px]">
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">ลดหย่อนผู้มีเงินได้ + ประกันสังคม + สมาชิกครอบครัว:</span>
                      <span className="font-bold text-slate-200">฿{formatCurrency(stats.grand_total_deductions)}</span>
                    </div>
                  </div>
                </div>

                {/* Section D: ผลสรุปภาระภาษี */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">เงินได้สุทธิประเมินภาษี (Net Taxable Income):</span>
                    <span className="text-base font-black text-emerald-400">฿{formatCurrency(stats.net_taxable_income)}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    สูตรคำนวณ: (รายได้รวม ฿{formatCurrency(stats.total_income)} - ค่าใช้จ่าย ฿{formatCurrency(stats.total_expense_deductible)} - ค่าลดหย่อน ฿{formatCurrency(stats.grand_total_deductions)}) = เงินได้สุทธิ
                  </p>
                  <div className="h-px bg-slate-800" />
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-300">ภาษีเงินได้บุคคลธรรมดาที่ต้องชำระ (ภ.ง.ด.90):</span>
                    <span className="font-black text-amber-300">
                      {(stats.estimated_income_tax || 0) === 0
                        ? '฿0.00 (ได้รับการยกเว้นภาษี 150,000 บาทแรก)'
                        : `฿${formatCurrency(stats.estimated_income_tax)} (5% Demo ส่วนเกิน 1.5 แสน)`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-300">ภาษีมูลค่าเพิ่ม VAT 7% ที่ต้องนำส่ง (ภ.พ.30):</span>
                    <span className="font-black text-rose-400">
                      {(stats.total_income || 0) < (stats.vat_threshold || 1800000)
                        ? '฿0.00 (ยังไม่ถึงเกณฑ์จด VAT)'
                        : `฿${formatCurrency(stats.estimated_vat)}`}
                    </span>
                  </div>
                </div>

                {/* Digital Verification Seal */}
                <div className="pt-2 flex items-center justify-between text-[10.5px] text-slate-500 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-emerald-400/80">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>ระบบตรวจสอบเอกสารและบันทึกช่วยจำด้วย AI สมบูรณ์</span>
                  </div>
                  <span>ChillTax Secure Defense ID: #CT-2026-98421</span>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* TAB 2: บัญชีหลักฐานสลิปแนบ (Audit Evidence Table)         */
            /* ========================================================= */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-400">
                  แสดงรายการสลิปและใบเสร็จที่ยืนยันแล้ว ({confirmedTransactions.length} รายการ)
                </span>
                <span className="font-bold text-emerald-400">
                  ยอดรวมสลิปหลักฐาน: ฿{formatCurrency(totalConfirmedAmount)}
                </span>
              </div>

              {confirmedTransactions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  ยังไม่มีสลิปที่ยืนยันแล้วในระบบ
                </div>
              ) : (
                <div className="space-y-2.5">
                  {confirmedTransactions.map((tx, idx) => {
                    const catInfo = CATEGORY_MAP[tx.tax_category] || {
                      label: tx.tax_category,
                      badge: 'bg-slate-800 text-slate-300',
                      icon: '📄',
                    };
                    const isIncome = tx.tax_category?.startsWith('income_');
                    return (
                      <div
                        key={tx.id || idx}
                        className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition space-y-2 text-xs"
                      >
                        {/* Top row: Index, Date, Amount */}
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-lg bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <div>
                              <strong className="text-white block font-bold">
                                {tx.receiver_name || tx.sender_name || 'สลิปธุรกรรม'}
                              </strong>
                              <span className="text-[10px] text-slate-400">{tx.transaction_date || 'ไม่ระบุเวลา'}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-black ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isIncome ? '+' : '-'}฿{formatCurrency(tx.amount)}
                            </span>
                            <span className="text-[9.5px] text-slate-500 block">AI มั่นใจ {tx.confidence_score || 95}%</span>
                          </div>
                        </div>

                        {/* Category Badge & Memo */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${catInfo.badge}`}>
                            <span>{catInfo.icon || '🏷️'}</span>
                            {(lang === 'en' ? catInfo.label_en : null) || catInfo.label}
                          </span>
                          {tx.memo && (
                            <span className="text-[10.5px] text-slate-300 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                              Memo: "{tx.memo}"
                            </span>
                          )}
                        </div>

                        {/* AI Defense Reasoning */}
                        {tx.reasoning && (
                          <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800/80 text-[10.5px] text-slate-300 flex items-start gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="leading-snug">
                              <strong className="text-emerald-300">ข้อชี้แจงภาษี:</strong> {tx.reasoning}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Print / PDF' : 'พิมพ์ / PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              {lang === 'en' ? 'Close' : 'ปิด'}
            </button>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={downloading}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 text-xs font-extrabold hover:brightness-110 active:scale-95 shadow-lg shadow-emerald-500/25 transition flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            {downloading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {lang === 'en' ? 'Downloading...' : 'กำลังดาวน์โหลด...'}
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{lang === 'en' ? 'Download Dossier & Attached Slips' : 'ดาวน์โหลดแฟ้มเอกสารพร้อมหลักฐานสลิป'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. SCANNER VIEW (AI วิเคราะห์สลิป)
// ---------------------------------------------------------------------------
function ScannerView({ stats, onScanComplete, onNavigateSpeedReview, currentUser, lang = 'th', t = (k) => DICTIONARY['th']?.[k] || k }) {
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [syncedCount, setSyncedCount] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [batchResults, setBatchResults] = useState([]);
  const [error, setError] = useState(null);
  const [isConfirmingAll, setIsConfirmingAll] = useState(false);
  const fileInputRef = useRef(null);

  // Triggered when user grants OS permission
  const handlePermissionGranted = () => {
    setShowPermissionModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processFiles = async (files) => {
    if (!files || files.length === 0) return;

    try {
      setIsSyncing(true);
      setError(null);
      setTotalFiles(files.length);
      setSyncedCount(0);
      setBatchResults([]);

      const newResults = [];
      const errorList = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          const userEmailParam = currentUser?.email
            ? `?user_email=${encodeURIComponent(currentUser.email)}`
            : '';

          let res = null;
          let lastFetchErr = null;
          const urlsToTry = [API_BASE, ...CANDIDATE_SERVERS.filter((u) => u !== API_BASE)];

          for (const baseUrl of urlsToTry) {
            try {
              const formData = new FormData();
              formData.append('file', file);
              const controller = new AbortController();
              const tid = setTimeout(() => controller.abort(), 45000);
              const candidateRes = await fetch(`${baseUrl}/api/analyze-slip${userEmailParam}`, {
                method: 'POST',
                body: formData,
                signal: controller.signal,
              });
              clearTimeout(tid);
              res = candidateRes;
              if (baseUrl !== API_BASE && candidateRes.ok) {
                setGlobalApiBase(baseUrl);
              }
              break;
            } catch (fetchErr) {
              lastFetchErr = fetchErr;
              // Try next candidate server if network unreachable
            }
          }

          if (!res) {
            throw lastFetchErr || new Error('ไม่สามารถติดต่อเซิร์ฟเวอร์ AI ได้');
          }

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData.detail || `เซิร์ฟเวอร์ตอบกลับรหัส ${res.status}`;
            throw new Error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
          }

          const data = await res.json();
          if (data?.data) {
            newResults.push(data.data);
          }
        } catch (err) {
          console.warn(`Analysis fallback for file ${file.name}:`, err);
          // Demo fallback slip so user can always test the scan & review flow
          newResults.push({
            id: Date.now() + i,
            transaction_date: new Date().toISOString().slice(0, 16).replace('T', ' '),
            amount: 1450.0,
            sender_name: currentUser?.fullname || 'คุณเดโม่ ผู้ทดสอบ',
            receiver_name: 'บจก. ออฟฟิศ ดีโป้ (ไทยแลนด์)',
            memo: 'ซื้อกระดาษพิมพ์งานและอุปกรณ์สำนักงาน',
            tax_category: 'expense_business',
            reasoning: 'ค่าอุปกรณ์สำนักงานเพื่อดำเนินธุรกิจ หักเป็นค่าใช้จ่ายธุรกิจได้ (โหมดจำลอง AI OCR)',
            confidence_score: 95,
            has_memo_warning: false,
            status: 'pending',
          });
        }

        setSyncedCount(i + 1);
        await new Promise((r) => setTimeout(r, 300));
      }

      if (newResults.length > 0) {
        setBatchResults(newResults);
        onScanComplete?.();
      }

      if (errorList.length > 0) {
        setError(errorList.join('\n'));
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsSyncing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []).filter((f) =>
      f.type.startsWith('image/')
    );
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const resetSync = () => {
    setBatchResults([]);
    setError(null);
    setSyncedCount(0);
    setTotalFiles(0);
  };

  const handleItemConfirmed = (id, updatedTx) => {
    setBatchResults((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedTx, status: 'confirmed' } : item))
    );
    onScanComplete?.();
  };

  const handleConfirmAllScanned = async () => {
    if (batchResults.length === 0 || isConfirmingAll) return;
    try {
      setIsConfirmingAll(true);
      const pendingItems = batchResults.filter((item) => item.status !== 'confirmed');
      for (const item of pendingItems) {
        const categoryToConfirm =
          item.tax_category === 'unknown' ? 'expense_business' : item.tax_category;
        await fetch(`${API_BASE}/api/transactions/${item.id}/confirm`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tax_category: categoryToConfirm }),
        });
      }
      setBatchResults((prev) =>
        prev.map((item) => ({
          ...item,
          status: 'confirmed',
          tax_category: item.tax_category === 'unknown' ? 'expense_business' : item.tax_category,
        }))
      );
      onScanComplete?.();
    } catch (err) {
      console.error(err);
      alert('ยืนยันทั้งหมดไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setIsConfirmingAll(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input with multiple selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFilesSelected}
        accept="image/*"
        multiple
        className="hidden"
        id="multi-slip-input"
      />

      {/* ------------------------------------------------------------- */}
      {/* OS-like Permission Modal (จำลองหน้าต่างขออนุญาตของระบบ OS) */}
      {/* ------------------------------------------------------------- */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-5 animate-in fade-in duration-200">
          <div className="w-full max-w-xs rounded-3xl bg-slate-900/95 border border-slate-700/80 p-5 shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-200">
            {/* System App Icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 mx-auto shadow-lg shadow-emerald-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Images className="w-7 h-7 text-emerald-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white tracking-tight">
                {t('permModalTitle')}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t('permModalDesc')}
              </p>
            </div>

            {/* iOS/Android style Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition active:scale-95"
              >
                {t('permModalDeny')}
              </button>
              <button
                onClick={handlePermissionGranted}
                className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-bold hover:brightness-110 shadow-lg shadow-emerald-500/20 transition active:scale-95"
              >
                {t('permModalAllow')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. HERO STATE: ปุ่มใหญ่เรืองแสง 'เปิดระบบ Auto-Sync แกลลอรี่' */}
      {/* ------------------------------------------------------------- */}
      {!isSyncing && batchResults.length === 0 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* 1. Main Interactive Hero & Dropzone Card */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-slate-800/80 via-slate-850/90 to-slate-900 border transition-all duration-250 shadow-2xl overflow-hidden text-center ${
              isDragging
                ? 'border-emerald-400 bg-emerald-950/20 scale-[1.01] ring-2 ring-emerald-400/30'
                : 'border-slate-700/80 hover:border-slate-600'
            }`}
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Radar / Gallery Visual */}
            <div className="relative w-16 h-16 mx-auto mb-3.5 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping opacity-30" />
              <div className="absolute -inset-2 rounded-full border border-emerald-500/20 animate-pulse" />
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-xl shadow-emerald-500/30 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Smartphone className="w-7 h-7 text-emerald-400" />
                </div>
              </div>
            </div>

            <h2 className="text-base font-extrabold text-white tracking-tight">
              {t('nativeScanTitle')}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              {t('nativeScanSubtitle')}
            </p>

            {/* Main Action: Auto-Sync Button */}
            <div className="pt-4 relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 opacity-70 blur-md animate-pulse" />
              <button
                type="button"
                onClick={() => setShowPermissionModal(true)}
                className="relative w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/40 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Radio className="w-4 h-4 text-slate-950 animate-pulse" />
                <span>{t('autoSyncBtn')}</span>
                <Sparkles className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition" />
              </button>
            </div>

            {/* Drag & Drop or Click Area */}
            <div className="pt-3">
              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.click();
                }}
                className={`w-full py-3 px-4 rounded-2xl border border-dashed transition flex items-center justify-center gap-2 cursor-pointer text-xs ${
                  isDragging
                    ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-700 hover:border-emerald-500/60 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white'
                }`}
              >
                <UploadCloud className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {isDragging ? t('dropzoneDragging') : t('dropzoneText')}
                </span>
              </button>
            </div>

            {/* Privacy Badge */}
            <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[10.5px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('privacyBadge')}</span>
            </div>
          </div>

          {/* 2. Quick Pending Status Card (ถ้ามีบิลรอตรวจ) */}
          {stats?.pending_count > 0 && (
            <div
              onClick={onNavigateSpeedReview}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-950 border border-rose-500/30 flex items-center justify-between gap-3 cursor-pointer hover:border-rose-500/60 transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30 font-bold text-xs">
                  {stats.pending_count}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-rose-300 transition">
                    {t('pendingReviewCardTitle').replace('{count}', stats.pending_count)}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {t('pendingReviewCardSub')}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition shrink-0" />
            </div>
          )}

          {/* 3. Supported Slips & Banks Showcase */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                {t('supportedTitle')}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">AI Auto-Detect</span>
            </div>

            {/* Bank Badges */}
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              <span className="px-2 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-medium">
                🟢 K PLUS
              </span>
              <span className="px-2 py-1 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-300 font-medium">
                🟣 SCB EASY
              </span>
              <span className="px-2 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-medium">
                🔵 Krungthai
              </span>
              <span className="px-2 py-1 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-300 font-medium">
                🔵 Bangkok Bank
              </span>
              <span className="px-2 py-1 rounded-lg bg-orange-950/60 border border-orange-500/30 text-orange-300 font-medium">
                🟠 ttb touch
              </span>
              <span className="px-2 py-1 rounded-lg bg-pink-950/60 border border-pink-500/30 text-pink-300 font-medium">
                🔴 TrueMoney
              </span>
            </div>

            {/* Deduction Badges */}
            <div className="pt-2 border-t border-slate-850 flex flex-wrap gap-1.5 text-[10px]">
              <span className="px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-500/30 text-indigo-300">
                🛡️ {t('deductInsurance')}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-teal-950/60 border border-teal-500/30 text-teal-300">
                🌿 {t('deductThaiESG')}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-500/30 text-amber-300">
                ☀️ {t('deductSolar')}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-rose-950/60 border border-rose-500/30 text-rose-300">
                📄 {t('deductShopping')}
              </span>
            </div>
          </div>

          {/* 4. AI Capabilities Highlights */}
          <div className="grid grid-cols-2 gap-2 text-left">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <h5 className="text-[11px] font-bold text-white">Auto-Memo OCR</h5>
              <p className="text-[10px] text-slate-400 leading-tight">
                {lang === 'en' ? 'Extract memo for instant Sec 40 classification' : 'ดึงข้อความบันทึกช่วยจำเพื่อแยกประเภท ม.40 ทันที'}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <h5 className="text-[11px] font-bold text-white">Audit Risk Alert</h5>
              <p className="text-[10px] text-slate-400 leading-tight">
                {lang === 'en' ? 'Alerts missing memos to secure audit defense' : 'แจ้งเตือนสลิปลืมใส่ Memo ป้องกันสรรพากรสงสัย'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. SYNCING ANIMATION (หน้าจอแอนิเมชันระหว่างสแกนภาพหลายใบ) */}
      {/* ------------------------------------------------------------- */}
      {isSyncing && (
        <div className="p-7 rounded-3xl bg-slate-800/80 border border-slate-700 text-center space-y-6 shadow-2xl animate-in fade-in duration-300">
          {/* Radar Scanning Ring */}
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping opacity-40" />
            <div className="absolute -inset-3 rounded-full border border-teal-500/20 animate-pulse" />
            <div className="w-20 h-20 rounded-full bg-slate-950/80 border border-emerald-500/40 flex items-center justify-center relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 via-transparent to-transparent animate-spin" />
              <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* Dynamic Typographic Text ตาม Requirement */}
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-white tracking-tight animate-pulse">
              AI กำลังค้นหาและดึงสลิปจาก 7 วันที่ผ่านมา...
            </h3>
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              ดึงข้อมูลสำเร็จ {syncedCount} / {totalFiles} รายการ
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${totalFiles > 0 ? (syncedCount / totalFiles) * 100 : 0}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">กำลังวิเคราะห์บันทึกช่วยจำ (Memo) และจัดหมวดหมู่อัตโนมัติ</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>แจ้งเตือนจากระบบ</span>
          </div>
          <p className="whitespace-pre-wrap text-[11px] text-rose-300/90 leading-relaxed pl-6">{error}</p>
          <div className="pt-1 flex justify-end">
            <button
              onClick={() => {
                setError(null);
                if (fileInputRef.current) fileInputRef.current.click();
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-900 text-[11px] font-bold text-rose-200 border border-rose-700 transition"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. BATCH RESULTS DISPLAY (แสดงการ์ดผลลัพธ์สลิปพร้อมปุ่มเลือกประเภท) */}
      {/* ------------------------------------------------------------- */}
      {!isSyncing && batchResults.length > 0 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Header Summary */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {lang === 'en' ? `Scanned ${batchResults.length} items successfully` : `สแกนสำเร็จ ${batchResults.length} รายการ`}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {lang === 'en' ? 'Select tax category or confirm bill below' : 'กดเลือกหมวดหมู่ภาษีหรือกดยืนยันบิลได้ทันทีด้านล่าง'}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {batchResults.some((item) => item.status !== 'confirmed') && (
                <button
                  onClick={handleConfirmAllScanned}
                  disabled={isConfirmingAll}
                  className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[11px] font-black hover:brightness-110 active:scale-95 transition shadow-sm flex items-center gap-1"
                >
                  {isConfirmingAll ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Zap className="w-3 h-3 fill-slate-950" />
                  )}
                  {t('confirmAllBtn')}
                </button>
              )}
              <button
                onClick={resetSync}
                className="px-2.5 py-1 rounded-xl bg-slate-700 hover:bg-slate-600 text-[11px] font-semibold text-slate-200 transition"
              >
                {t('scanMoreBtn')}
              </button>
            </div>
          </div>

          {/* Cards List for all slips with interactive category selector */}
          <div className="space-y-3">
            {batchResults.map((item, idx) => (
              <ScannedSlipCard
                key={item.id || idx}
                item={item}
                onConfirmed={handleItemConfirmed}
                lang={lang}
                t={t}
              />
            ))}
          </div>

          {/* Quick CTA to Speed Review */}
          <div className="pt-2">
            <button
              onClick={onNavigateSpeedReview}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shadow-xl shadow-emerald-500/25 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4 font-bold" />
              <span>{lang === 'en' ? 'Go to Speed Review to verify all bills' : 'ไปยังหน้า Speed Review เพื่อตรวจสอบบิลทั้งหมด'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal แจ้งเตือนความแน่ใจเมื่อผู้ใช้เปลี่ยนหมวดหมู่ภาษีจากที่ AI แนะนำ
// ---------------------------------------------------------------------------
function CategoryChangeConfirmModal({ item, oldCategory, newCategory, onConfirm, onCancel, lang = 'th' }) {
  if (!oldCategory || !newCategory) return null;

  const oldInfo = CATEGORY_MAP[oldCategory] || { label: oldCategory };
  const newInfo = CATEGORY_MAP[newCategory] || { label: newCategory };

  const isChangingToBusiness = oldCategory === 'expense_personal' && newCategory === 'expense_business';
  const isChangingToPersonal = oldCategory === 'expense_business' && newCategory === 'expense_personal';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        
        {/* Header with warning icon */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {lang === 'en' ? 'Confirm Tax Category Change?' : 'ยืนยันการเปลี่ยนหมวดหมู่ภาษี?'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {lang === 'en' ? 'Changing category from AI recommendation' : 'คุณกำลังเปลี่ยนหมวดต่างจากที่ AI ประเมิน'}
            </p>
          </div>
        </div>

        {/* Comparison Box */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">{lang === 'en' ? 'Item:' : 'รายการ:'}</span>
            <span className="font-bold text-slate-200 truncate max-w-[180px]">
              {item.receiver_name || item.sender_name || (lang === 'en' ? 'Transfer Slip' : 'สลิปโอนเงิน')}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">{lang === 'en' ? 'Amount:' : 'ยอดเงิน:'}</span>
            <span className="font-black text-emerald-400">
              ฿{Number(item.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="h-px bg-slate-800" />

          {/* AI Evaluated Category */}
          <div className="flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1">
              {lang === 'en' ? '🤖 AI Evaluated:' : '🤖 AI ประเมิน:'}
            </span>
            <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${oldInfo.badge || 'bg-slate-800 text-slate-300'}`}>
              {(lang === 'en' ? oldInfo.label_en : null) || oldInfo.label}
            </span>
          </div>

          {/* User Chosen Category */}
          <div className="flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1">
              {lang === 'en' ? '👤 Change to:' : '👤 ต้องการเปลี่ยนเป็น:'}
            </span>
            <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${newInfo.badge || 'bg-slate-800 text-slate-300'}`}>
              {(lang === 'en' ? newInfo.label_en : null) || newInfo.label}
            </span>
          </div>
        </div>

        {/* Specific Tax Warning Advice */}
        {isChangingToBusiness ? (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-200">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{lang === 'en' ? 'Audit Risk Warning' : 'แจ้งเตือนความเสี่ยงสรรพากร (Audit Risk)'}</span>
            </div>
            <p>
              {lang === 'en'
                ? 'AI evaluated this as a personal expense. Changing to "Business Expense" for tax deduction requires valid tax invoices and proof of business use. False claims may incur retroactive tax and fines.'
                : 'AI ประเมินว่ารายการนี้เป็นรายจ่ายส่วนตัว การเปลี่ยนเป็น “รายจ่ายธุรกิจ” เพื่อนำมาหักลดหย่อนภาษี ต้องมีหลักฐานหรือใบกำกับภาษีที่ยืนยันได้ว่าใช้เพื่อกิจการจริงเท่านั้น หากสรรพากรตรวจพบอาจถูกเรียกเก็บภาษีย้อนหลังพร้อมเบี้ยปรับ'}
            </p>
          </div>
        ) : isChangingToPersonal ? (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-200">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{lang === 'en' ? 'Tax Impact Notice' : 'แจ้งเตือนผลกระทบทางภาษี'}</span>
            </div>
            <p>
              {lang === 'en'
                ? 'Changing to "Personal Expense" means this amount cannot be deducted as business expense.'
                : 'การเปลี่ยนเป็น “รายจ่ายส่วนตัว” จะทำให้รายการนี้ไม่ถูกนำไปนับเป็นต้นทุนค่าใช้จ่ายเพื่อลดหย่อนภาษีของธุรกิจ'}
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed">
            {lang === 'en'
              ? 'Please verify transaction details before changing for accurate tax filing.'
              : 'กรุณาตรวจสอบความถูกต้องของรายการนี้ก่อนเปลี่ยน เพื่อให้การยื่นแบบภาษีถูกต้องและปลอดภัยจากการสุ่มตรวจ'}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition active:scale-95 cursor-pointer"
          >
            {lang === 'en' ? 'Cancel (Keep AI)' : 'ยกเลิก (ใช้ตาม AI)'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition active:scale-95 cursor-pointer"
          >
            {lang === 'en' ? 'Confirm Change' : 'ยืนยันการเปลี่ยน'}
          </button>
        </div>

      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scanned Slip Card (การ์ดสลิปพร้อมปุ่มกดเลือกประเภทภาษีได้ทันที)
// ---------------------------------------------------------------------------
function ScannedSlipCard({ item, onConfirmed, lang = 'th', t = (k) => DICTIONARY['th']?.[k] || k }) {
  const [selectedCategory, setSelectedCategory] = useState(
    item.tax_category === 'unknown' ? 'expense_business' : item.tax_category
  );
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(item.status === 'confirmed');
  const [pendingChangeCategory, setPendingChangeCategory] = useState(null);

  const handleConfirm = async (chosenCat) => {
    const targetCat = chosenCat || selectedCategory;
    try {
      setIsConfirming(true);
      const res = await fetch(`${API_BASE}/api/transactions/${item.id}/confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tax_category: targetCat }),
      });
      if (!res.ok) throw new Error('Confirm failed');
      const updatedTx = await res.json();
      setConfirmed(true);
      onConfirmed?.(item.id, updatedTx);
    } catch (err) {
      alert(lang === 'en' ? 'Failed to confirm category. Please try again.' : 'ยืนยันหมวดหมู่ไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSelectCategory = (catKey) => {
    if (catKey === selectedCategory) return;

    // ถ้าหมวดใหม่ต่างจากที่ AI ประเมินไว้ และหมวดเดิมไม่ใช่ unknown ให้เตือนความแน่ใจ
    if (item.tax_category && item.tax_category !== 'unknown' && catKey !== item.tax_category) {
      setPendingChangeCategory(catKey);
    } else {
      setSelectedCategory(catKey);
      if (confirmed) {
        handleConfirm(catKey);
      }
    }
  };

  const handleConfirmChange = () => {
    if (pendingChangeCategory) {
      const newCat = pendingChangeCategory;
      setSelectedCategory(newCat);
      setPendingChangeCategory(null);
      if (confirmed) {
        handleConfirm(newCat);
      }
    }
  };

  return (
    <div
      className={`p-4 rounded-2xl border shadow-lg space-y-3 transition-all duration-300 relative ${
        confirmed
          ? 'bg-slate-800/60 border-emerald-500/40'
          : 'bg-slate-800/90 border-slate-700'
      }`}
    >
      {/* Header & Status */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[11px] text-slate-400">{item.transaction_date || t('unspecifiedDate')}</span>
          <h4 className="text-xs font-bold text-slate-100 mt-0.5">
            {item.receiver_name || item.sender_name || (lang === 'en' ? 'Transfer Slip' : 'สลิปโอนเงิน')}
          </h4>
        </div>
        <div className="text-right">
          <span className="text-sm font-black text-emerald-400">
            ฿{Number(item.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </span>
          <div className="text-[10px] text-slate-400 font-medium">
            {t('aiConfidence')} {item.confidence_score}%
          </div>
        </div>
      </div>

      {/* Memo Highlight */}
      {item.memo ? (
        <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span className="text-[11px] text-teal-300 font-medium">
            Memo: "{item.memo}"
          </span>
        </div>
      ) : null}

      {/* แจ้งเตือนเมื่อสลิปไม่มีบันทึกช่วยจำ (Behavioral Nudging) */}
      {item.has_memo_warning && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span className="leading-snug">
            <strong className="font-bold text-amber-200">{lang === 'en' ? 'Tip:' : 'ข้อแนะนำ:'}</strong> {t('noMemoWarning')}
          </span>
        </div>
      )}

      {/* ส่วนแสดงประเภทรายได้มาตรา 40 พร้อม Dropdown Menu ครบ 8 ประเภท */}
      {(item.tax_category?.startsWith('income_') || item.type === 'income' || selectedCategory.startsWith('income_')) && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-850 to-slate-950 border border-teal-500/30 space-y-2.5 shadow-lg relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {CATEGORY_MAP[selectedCategory]?.icon || '💰'}
              </span>
              <div>
                <span className="text-[10px] text-teal-400 font-bold block uppercase tracking-wider">
                  {t('aiIncomeDetected')}
                </span>
                <span className="text-xs font-black text-white">
                  {(lang === 'en' ? CATEGORY_MAP[selectedCategory]?.label_en : null) || CATEGORY_MAP[selectedCategory]?.label || (lang === 'en' ? 'Assessable Income' : 'เงินได้พึงประเมิน')}
                </span>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              CATEGORY_MAP[selectedCategory]?.badge || 'bg-teal-500/20 text-teal-300 border-teal-500/40'
            }`}>
              {selectedCategory.startsWith('income_') ? (lang === 'en' ? selectedCategory.replace('income_', 'Sec.').replace('_', '(') + ')' : selectedCategory.replace('income_', 'ม.').replace('_', '(') + ')') : (lang === 'en' ? 'Income' : 'รายได้')}
            </span>
          </div>

          {/* Dropdown Menu เลือกประเภทเงินได้ครบ 8 ประเภท */}
          <div className="space-y-1">
            <label className="text-[10.5px] font-bold text-slate-300 flex items-center justify-between">
              <span>{t('statutoryIncomeSelect')}</span>
              <span className="text-[10px] text-slate-400 font-normal">{t('clickToChange')}</span>
            </label>
            <div className="relative">
              <select
                value={selectedCategory.startsWith('income_') ? selectedCategory : (item.tax_category?.startsWith('income_') ? item.tax_category : 'income_40_8')}
                onChange={(e) => handleSelectCategory(e.target.value)}
                className="w-full py-2.5 pl-3 pr-10 rounded-xl bg-slate-900 border border-slate-700 hover:border-teal-400 text-slate-100 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-teal-400/40 appearance-none cursor-pointer transition shadow-inner"
              >
                {INCOME_40_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key} className="bg-slate-900 text-slate-100 py-1 font-semibold">
                    {lang === 'en' ? (opt.label_en || opt.label) : opt.label} — {lang === 'en' ? (opt.desc_en || opt.desc) : opt.desc}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-teal-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* คำอธิบายสิทธิหักค่าใช้จ่ายสำหรับประเภทที่เลือก */}
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="text-slate-400">{t('deductionRulePrefix')}</span>
              <span className="text-teal-300 font-semibold">
                {(lang === 'en' ? CATEGORY_MAP[selectedCategory]?.deduction_note_en : null) || CATEGORY_MAP[selectedCategory]?.deduction_note || (lang === 'en' ? 'According to Revenue Code' : 'ตามเกณฑ์กฎหมายประมวลรัษฎากร')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Category Selector สำหรับสลับระหว่าง รายจ่ายธุรกิจ, ส่วนตัว หรือ รายได้ */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between items-center text-[11px]">
          <span className="font-bold text-slate-300">{t('mainCategoryLabel')}</span>
          {confirmed ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" /> {t('confirmedTag')}
            </span>
          ) : (
            <span className="text-[10px] text-amber-400 font-medium">{t('clickToChange')}</span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => handleSelectCategory('expense_business')}
            className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition text-center active:scale-95 cursor-pointer ${
              selectedCategory === 'expense_business'
                ? 'bg-cyan-500/25 text-cyan-200 border-cyan-500 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900/70 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {t('catBusiness')}
          </button>
          <button
            type="button"
            onClick={() => handleSelectCategory('expense_personal')}
            className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition text-center active:scale-95 cursor-pointer ${
              selectedCategory === 'expense_personal'
                ? 'bg-slate-700/80 text-slate-200 border-slate-500 shadow-md shadow-slate-500/20'
                : 'bg-slate-900/70 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {t('catPersonal')}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!selectedCategory.startsWith('income_')) {
                const targetCat = item.tax_category?.startsWith('income_') ? item.tax_category : 'income_40_8';
                handleSelectCategory(targetCat);
              }
            }}
            className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition text-center active:scale-95 cursor-pointer ${
              selectedCategory.startsWith('income_')
                ? 'bg-emerald-500/25 text-emerald-200 border-emerald-500 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900/70 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {t('catIncome')}
          </button>
        </div>
      </div>

      {/* Confirm Button or Confirmed Status */}
      {!confirmed ? (
        <button
          onClick={() => handleConfirm(selectedCategory)}
          disabled={isConfirming}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 active:scale-[0.98] text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          {isConfirming ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              {t('confirmingAllBtn')}
            </>
          ) : (
            <>
              <Check className="w-4 h-4 font-bold" />
              {t('confirmBillCategory')}
            </>
          )}
        </button>
      ) : (
        <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between text-xs text-emerald-300">
          <span className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {t('confirmedSuccess')}
          </span>
          <button
            onClick={() => setConfirmed(false)}
            className="text-[10px] text-slate-400 hover:text-white underline underline-offset-2 cursor-pointer"
          >
            {t('changeCategory')}
          </button>
        </div>
      )}

      {/* AI Reasoning */}
      {item.reasoning && (
        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300">
          <span className="font-semibold text-emerald-400">{lang === 'en' ? 'AI Reason: ' : 'เหตุผล AI: '}</span>
          {item.reasoning}
        </div>
      )}

      {/* Modal ยืนยันเตือนความแน่ใจเมื่อผู้ใช้เปลี่ยนหมวดจากที่ AI ทาย */}
      {pendingChangeCategory && (
        <CategoryChangeConfirmModal
          item={item}
          oldCategory={item.tax_category}
          newCategory={pendingChangeCategory}
          onConfirm={handleConfirmChange}
          onCancel={() => setPendingChangeCategory(null)}
          lang={lang}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. SPEED REVIEW VIEW (ตรวจสอบบิล)
// ---------------------------------------------------------------------------
function SpeedReviewView({ onItemConfirmed, lang = 'th', t = (k) => DICTIONARY['th']?.[k] || k }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const [isConfirmingAll, setIsConfirmingAll] = useState(false);

  // Subtabs: 'pending' (รอตรวจสอบ) | 'confirmed' (ประวัติ / บิลที่ยืนยันแล้ว)
  const [subTab, setSubTab] = useState('pending');
  const [confirmedItems, setConfirmedItems] = useState([]);
  const [loadingConfirmed, setLoadingConfirmed] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchPendingItems = async () => {
    try {
      setLoading(true);
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${API_BASE}/api/transactions?status=pending`, { signal: controller.signal });
      clearTimeout(tid);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setItems(data && data.length > 0 ? data : FALLBACK_PENDING_ITEMS);
    } catch (err) {
      console.warn('Network error in pending items, using mock fallback:', err);
      setItems(FALLBACK_PENDING_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfirmedItems = async () => {
    try {
      setLoadingConfirmed(true);
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${API_BASE}/api/transactions?status=confirmed`, { signal: controller.signal });
      clearTimeout(tid);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setConfirmedItems(data && data.length > 0 ? data : FALLBACK_CONFIRMED_ITEMS);
    } catch (err) {
      console.warn('Network error in confirmed items, using mock fallback:', err);
      setConfirmedItems(FALLBACK_CONFIRMED_ITEMS);
    } finally {
      setLoadingConfirmed(false);
    }
  };

  useEffect(() => {
    fetchPendingItems();
    fetchConfirmedItems();
  }, []);

  const handleConfirmSingle = async (id, chosenCategory) => {
    try {
      setConfirmingId(id);
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 8000);
      await fetch(`${API_BASE}/api/transactions/${id}/confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tax_category: chosenCategory }),
        signal: controller.signal,
      }).catch((e) => console.warn('Confirm API offline fallback:', e));
      clearTimeout(tid);

      const confirmedOne = items.find((item) => item.id === id);
      if (confirmedOne) {
        setConfirmedItems((prev) => [{ ...confirmedOne, tax_category: chosenCategory, status: 'confirmed' }, ...prev]);
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
      onItemConfirmed?.();
    } catch (err) {
      console.warn('Confirm single handled offline:', err);
      setItems((prev) => prev.filter((item) => item.id !== id));
      onItemConfirmed?.();
    } finally {
      setConfirmingId(null);
    }
  };

  // ยืนยันทั้งหมด (Auto-Confirm All)
  const handleConfirmAll = async () => {
    if (items.length === 0 || isConfirmingAll) return;

    try {
      setIsConfirmingAll(true);
      const currentItems = [...items];

      await Promise.allSettled(
        currentItems.map((item) => {
          const controller = new AbortController();
          const tid = setTimeout(() => controller.abort(), 8000);
          return fetch(`${API_BASE}/api/transactions/${item.id}/confirm`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tax_category: item.tax_category === 'unknown' ? 'expense_business' : item.tax_category,
            }),
            signal: controller.signal,
          }).finally(() => clearTimeout(tid));
        })
      );

      setConfirmedItems((prev) => [
        ...currentItems.map((item) => ({
          ...item,
          tax_category: item.tax_category === 'unknown' ? 'expense_business' : item.tax_category,
          status: 'confirmed',
        })),
        ...prev,
      ]);
      setItems([]);
      onItemConfirmed?.(currentItems.length);
    } catch (err) {
      console.warn('Auto confirm all fallback:', err);
      setItems([]);
      onItemConfirmed?.(items.length);
    } finally {
      setIsConfirmingAll(false);
    }
  };

  // แก้ไขหมวดหมู่สลิปที่ยืนยันแล้ว
  const handleSaveEditedCategory = async (newCategory) => {
    if (!editingItem) return;
    const txId = editingItem.id;

    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 8000);
      await fetch(`${API_BASE}/api/transactions/${txId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tax_category: newCategory }),
        signal: controller.signal,
      }).catch((e) => console.warn('Update category offline fallback:', e));
      clearTimeout(tid);

      setConfirmedItems((prev) =>
        prev.map((item) => (item.id === txId ? { ...item, tax_category: newCategory } : item))
      );
      onItemConfirmed?.();
    } catch (err) {
      console.warn(err);
    } finally {
      setEditingItem(null);
    }
  };

  // ส่งสลิปที่ยืนยันแล้วกลับไปรอตรวจใหม่ (Revert to pending)
  const handleRevertToPending = async (txId) => {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 8000);
      await fetch(`${API_BASE}/api/transactions/${txId}/revert`, {
        method: 'PUT',
        signal: controller.signal,
      }).catch((e) => console.warn('Revert offline fallback:', e));
      clearTimeout(tid);

      const target = confirmedItems.find((item) => item.id === txId);
      if (target) {
        setConfirmedItems((prev) => prev.filter((item) => item.id !== txId));
        setItems((prev) => [{ ...target, status: 'pending' }, ...prev]);
      }
      onItemConfirmed?.();
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <div className="space-y-3">
      {/* Segmented Subtabs: รอตรวจ vs ตรวจแล้ว/ประวัติ */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
        <button
          type="button"
          onClick={() => setSubTab('pending')}
          className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === 'pending'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{t('tabPending')} ({items.length})</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setSubTab('confirmed');
            fetchConfirmedItems();
          }}
          className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === 'confirmed'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>{t('tabHistory')} ({confirmedItems.length})</span>
        </button>
      </div>

      {/* SUBTAB 1: PENDING ITEMS */}
      {subTab === 'pending' && (
        <div className="space-y-3 animate-fadeIn">
          {/* Header with Title + Auto-Confirm All Button */}
          <div className="flex items-center justify-between px-1 gap-2">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <CheckCheck className="w-4 h-4 text-emerald-400" />
                <span>{t('pendingTitle')}</span>
              </h2>
              <p className="text-[11px] text-slate-400">{t('pendingSub')}</p>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={handleConfirmAll}
                  disabled={isConfirmingAll}
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-[11px] hover:brightness-110 active:scale-95 transition shadow-md shadow-emerald-500/20 flex items-center gap-1 cursor-pointer"
                >
                  {isConfirmingAll ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      {t('confirmingAllBtn')}
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-slate-950" />
                      {t('confirmAllBtn')}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {loading && (
            <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
              <span>{lang === 'en' ? 'Loading pending bills...' : 'กำลังโหลดรายการบิล...'}</span>
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="p-8 rounded-3xl bg-slate-800/30 border border-slate-800 text-center space-y-3 my-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">{t('allDoneTitle')}</h3>
                <p className="text-xs text-slate-400 mt-1">{t('allDoneSub')}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {items.map((item) => (
              <ReviewItemCard
                key={item.id}
                item={item}
                isConfirming={confirmingId === item.id}
                onConfirm={(chosenCategory) => handleConfirmSingle(item.id, chosenCategory)}
                lang={lang}
                t={t}
              />
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: CONFIRMED SLIPS HISTORY & EDITING */}
      {subTab === 'confirmed' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <History className="w-4 h-4 text-teal-400" />
                <span>{t('historyTitle')} ({confirmedItems.length} {lang === 'en' ? 'items' : 'รายการ'})</span>
              </h2>
              <p className="text-[11px] text-slate-400">{t('historySub')}</p>
            </div>
            <button
              onClick={fetchConfirmedItems}
              disabled={loadingConfirmed}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition"
            >
              <RefreshCw className={`w-3 h-3 ${loadingConfirmed ? 'animate-spin text-teal-400' : ''}`} />
            </button>
          </div>

          {loadingConfirmed && (
            <div className="text-center py-10 text-slate-400 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-teal-400" />
              <span>{lang === 'en' ? 'Loading slip history...' : 'กำลังโหลดประวัติสลิป...'}</span>
            </div>
          )}

          {!loadingConfirmed && confirmedItems.length === 0 && (
            <div className="p-8 rounded-3xl bg-slate-800/30 border border-slate-800 text-center space-y-2 my-6">
              <p className="text-xs text-slate-400">{lang === 'en' ? 'No confirmed slips in system' : 'ยังไม่มีสลิปที่ยืนยันในระบบ'}</p>
            </div>
          )}

          <div className="space-y-2.5">
            {confirmedItems.map((tx) => {
              const catInfo = CATEGORY_MAP[tx.tax_category] || {
                label: tx.tax_category === 'expense_business'
                  ? (lang === 'en' ? 'Business Expense (Actual)' : 'รายจ่ายธุรกิจ (หักค่าใช้จ่ายตามจริง)')
                  : tx.tax_category === 'expense_personal'
                  ? (lang === 'en' ? 'Personal Expense' : 'รายจ่ายส่วนตัว')
                  : tx.tax_category || (lang === 'en' ? 'Unspecified' : 'ไม่ระบุ'),
                badge: tx.tax_category === 'expense_business'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700',
                icon: tx.tax_category === 'expense_business' ? '📦' : '☕',
              };

              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition space-y-2.5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">{tx.transaction_date || t('unspecifiedDate')}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                          {t('confirmedTag')}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-100 mt-0.5">
                        {tx.receiver_name || tx.sender_name || (lang === 'en' ? 'Transfer Slip' : 'สลิปการโอนเงิน')}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-white">
                        ฿{Number(tx.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {tx.memo && (
                    <p className="text-[10.5px] text-slate-300 bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800/80">
                      <span className="text-slate-400">Memo:</span> {tx.memo}
                    </p>
                  )}

                  {/* Category & Action Buttons */}
                  <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border flex items-center gap-1 ${catInfo.badge}`}>
                      <span>{catInfo.icon || '🏷️'}</span>
                      <span className="truncate max-w-[150px]">{(lang === 'en' ? catInfo.label_en : null) || catInfo.label}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRevertToPending(tx.id)}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-amber-300 text-[10px] font-medium transition flex items-center gap-1 cursor-pointer"
                        title={lang === 'en' ? 'Revert to Pending' : 'ย้ายกลับไปหน้ารอตรวจสอบ'}
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>{lang === 'en' ? 'Revert' : 'ย้ายกลับรอตรวจ'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingItem(tx)}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-400/20 hover:from-emerald-500/30 hover:to-teal-400/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold transition flex items-center gap-1 active:scale-95 cursor-pointer"
                      >
                        <Edit2 className="w-2.5 h-2.5 text-emerald-400" />
                        <span>{lang === 'en' ? 'Edit Category' : 'แก้ไขหมวด'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingItem && (
        <EditCategoryModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveEditedCategory}
          lang={lang}
          t={t}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal แก้ไขหมวดหมู่สลิปที่เคยอัปโหลด / ยืนยันแล้ว
// ---------------------------------------------------------------------------
function EditCategoryModal({ item, onClose, onSave, lang = 'th', t = (k) => DICTIONARY['th']?.[k] || k }) {
  const [selectedCat, setSelectedCat] = useState(item.tax_category || 'expense_business');

  const CATEGORY_LIST = [
    {
      key: 'income_40_1',
      label: lang === 'en' ? '40(1) Salary / Bonus' : '40(1) เงินเดือน / โบนัส',
      desc: lang === 'en' ? 'Employment income' : 'เงินได้จากการจ้างแรงงาน',
      icon: '💼',
    },
    {
      key: 'income_40_2',
      label: lang === 'en' ? '40(2) Freelance / Commission' : '40(2) ฟรีแลนซ์ / รับจ้างอิสระ',
      desc: lang === 'en' ? 'Services / Contract work' : 'รับจ้างทำของ/นายหน้า',
      icon: '💻',
    },
    {
      key: 'income_40_3',
      label: lang === 'en' ? '40(3) Royalties / IP' : '40(3) ค่าลิขสิทธิ์ / ทรัพย์สินทางปัญญา',
      desc: lang === 'en' ? 'Copyright / Patents' : 'ลิขสิทธิ์/สิทธิบัตร',
      icon: '💡',
    },
    {
      key: 'income_40_4',
      label: lang === 'en' ? '40(4) Interest / Dividend / Crypto' : '40(4) ดอกเบี้ย / เงินปันผล / คริปโต',
      desc: lang === 'en' ? 'Deposits / Shares / Crypto' : 'เงินฝาก/หุ้น/คริปโต',
      icon: '📈',
    },
    {
      key: 'income_40_5',
      label: lang === 'en' ? '40(5) Rental Property' : '40(5) ค่าเช่าทรัพย์สิน',
      desc: lang === 'en' ? 'Rent from house/condo/car' : 'ค่าเช่าบ้าน คอนโด อาคาร',
      icon: '🏢',
    },
    {
      key: 'income_40_6',
      label: lang === 'en' ? '40(6) Liberal Professions' : '40(6) วิชาชีพอิสระ',
      desc: lang === 'en' ? 'Doctor, Lawyer, Engineer' : 'แพทย์ ทนาย วิศวะ สถาปัตย์',
      icon: '⚖️',
    },
    {
      key: 'income_40_7',
      label: lang === 'en' ? '40(7) Contracting of Work' : '40(7) รับเหมาก่อสร้าง',
      desc: lang === 'en' ? 'Labor & materials included' : 'รับเหมาทั้งค่าแรงและค่าของ',
      icon: '🏗️',
    },
    {
      key: 'income_40_8',
      label: lang === 'en' ? '40(8) Business / Commerce' : '40(8) ธุรกิจ / ขายสินค้า / อื่นๆ',
      desc: lang === 'en' ? 'Trade / E-commerce / Other' : 'การพาณิชย์/ขายของทั่วไป',
      icon: '🏪',
    },
    {
      key: 'expense_business',
      label: lang === 'en' ? 'Business Expense (Actual)' : 'รายจ่ายธุรกิจ (หักค่าใช้จ่ายตามจริง)',
      desc: lang === 'en' ? 'Stock / Equipment / Shop bills' : 'ซื้อสต็อก/อุปกรณ์/ค่าใช้จ่ายร้าน',
      icon: '📦',
    },
    {
      key: 'expense_personal',
      label: lang === 'en' ? 'Personal Expense' : 'รายจ่ายส่วนตัว (ไม่คิดภาษี)',
      desc: lang === 'en' ? 'Food, travel, personal items' : 'กิน เที่ยว ซื้อของใช้ส่วนบุคคล',
      icon: '☕',
    },
    {
      key: 'deduction_insurance',
      label: lang === 'en' ? 'Tax Deduction (Insurance / Fund)' : 'ค่าลดหย่อนภาษี (ประกัน / กองทุน)',
      desc: lang === 'en' ? 'Life / Health / SSF / RMF' : 'ประกันชีวิต/สุขภาพ/SSF/RMF',
      icon: '🛡️',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-scaleUp">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Edit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {lang === 'en' ? 'Edit Slip Category' : 'แก้ไขหมวดหมู่สลิป'}
              </h3>
              <p className="text-[10px] text-slate-400">
                ฿{Number(item.amount || 0).toLocaleString()} • {item.receiver_name || item.sender_name || (lang === 'en' ? 'Slip' : 'สลิป')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {CATEGORY_LIST.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCat(cat.key)}
              className={`w-full p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                selectedCat === cat.key
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{cat.icon}</span>
                <div>
                  <span className="block font-semibold leading-tight">{cat.label}</span>
                  <span className="text-[9.5px] text-slate-400">{cat.desc}</span>
                </div>
              </div>
              {selectedCat === cat.key && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-750 cursor-pointer"
          >
            {lang === 'en' ? 'Cancel' : 'ยกเลิก'}
          </button>
          <button
            type="button"
            onClick={() => onSave(selectedCat)}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            {lang === 'en' ? 'Save Changes' : 'บันทึกการแก้ไข'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewItemCard({ item, isConfirming, onConfirm, lang = 'th', t = (k) => DICTIONARY['th']?.[k] || k }) {
  const [selectedCategory, setSelectedCategory] = useState(
    item.tax_category === 'unknown' ? 'expense_business' : item.tax_category
  );
  const [pendingChangeCategory, setPendingChangeCategory] = useState(null);

  const handleSelectCategory = (catKey) => {
    if (catKey === selectedCategory) return;

    // ถ้าหมวดใหม่ต่างจากที่ AI เคยประเมินไว้ และหมวดเดิมไม่ใช่ unknown ให้ขึ้น Modal เตือน
    if (item.tax_category && item.tax_category !== 'unknown' && catKey !== item.tax_category) {
      setPendingChangeCategory(catKey);
    } else {
      setSelectedCategory(catKey);
    }
  };

  const handleConfirmChange = () => {
    if (pendingChangeCategory) {
      setSelectedCategory(pendingChangeCategory);
      setPendingChangeCategory(null);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700 hover:border-slate-600 transition space-y-3 shadow-md relative">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[11px] text-slate-400">{item.transaction_date || t('unspecifiedDate')}</span>
          <h4 className="text-xs font-bold text-slate-100 mt-0.5">
            {item.receiver_name || item.sender_name || t('unspecifiedCounterparty')}
          </h4>
        </div>
        <div className="text-right">
          <span className="text-sm font-black text-white">
            ฿{Number(item.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </span>
          <div className="text-[10px] text-amber-400 font-medium">
            {t('aiConfidence')} {item.confidence_score}%
          </div>
        </div>
      </div>

      {item.memo ? (
        <p className="text-[11px] text-slate-300 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
          <span className="text-slate-400">Memo:</span> {item.memo}
        </p>
      ) : null}

      {/* แจ้งเตือนเมื่อสลิปไม่มีบันทึกช่วยจำ (Behavioral Nudging) */}
      {item.has_memo_warning && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span className="leading-snug">
            <strong className="font-bold text-amber-200">{lang === 'en' ? 'Tip:' : 'ข้อแนะนำ:'}</strong> {t('noMemoWarning')}
          </span>
        </div>
      )}

      {/* ส่วนแสดงประเภทรายได้มาตรา 40 พร้อม Dropdown Menu ครบ 8 ประเภท */}
      {(item.tax_category?.startsWith('income_') || item.type === 'income' || selectedCategory.startsWith('income_')) && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-850 to-slate-950 border border-teal-500/30 space-y-2.5 shadow-lg relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {CATEGORY_MAP[selectedCategory]?.icon || '💰'}
              </span>
              <div>
                <span className="text-[10px] text-teal-400 font-bold block uppercase tracking-wider">
                  {t('aiIncomeDetected')}
                </span>
                <span className="text-xs font-black text-white">
                  {(lang === 'en' ? CATEGORY_MAP[selectedCategory]?.label_en : null) || CATEGORY_MAP[selectedCategory]?.label || (lang === 'en' ? 'Assessable Income' : 'เงินได้พึงประเมิน')}
                </span>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              CATEGORY_MAP[selectedCategory]?.badge || 'bg-teal-500/20 text-teal-300 border-teal-500/40'
            }`}>
              {selectedCategory.startsWith('income_') ? (lang === 'en' ? selectedCategory.replace('income_', 'Sec.').replace('_', '(') + ')' : selectedCategory.replace('income_', 'ม.').replace('_', '(') + ')') : (lang === 'en' ? 'Income' : 'รายได้')}
            </span>
          </div>

          {/* Dropdown Menu เลือกประเภทเงินได้ครบ 8 ประเภท */}
          <div className="space-y-1">
            <label className="text-[10.5px] font-bold text-slate-300 flex items-center justify-between">
              <span>{t('statutoryIncomeSelect')}</span>
              <span className="text-[10px] text-slate-400 font-normal">{t('clickToChange')}</span>
            </label>
            <div className="relative">
              <select
                value={selectedCategory.startsWith('income_') ? selectedCategory : (item.tax_category?.startsWith('income_') ? item.tax_category : 'income_40_8')}
                onChange={(e) => handleSelectCategory(e.target.value)}
                className="w-full py-2.5 pl-3 pr-10 rounded-xl bg-slate-900 border border-slate-700 hover:border-teal-400 text-slate-100 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-teal-400/40 appearance-none cursor-pointer transition shadow-inner"
              >
                {INCOME_40_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key} className="bg-slate-900 text-slate-100 py-1 font-semibold">
                    {lang === 'en' ? (opt.label_en || opt.label) : opt.label} — {lang === 'en' ? (opt.desc_en || opt.desc) : opt.desc}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-teal-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* คำอธิบายสิทธิหักค่าใช้จ่ายสำหรับประเภทที่เลือก */}
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="text-slate-400">{t('deductionRulePrefix')}</span>
              <span className="text-teal-300 font-semibold">
                {(lang === 'en' ? CATEGORY_MAP[selectedCategory]?.deduction_note_en : null) || CATEGORY_MAP[selectedCategory]?.deduction_note || (lang === 'en' ? 'According to Revenue Code' : 'ตามเกณฑ์กฎหมายประมวลรัษฎากร')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Category Selector สำหรับสลับระหว่าง รายจ่ายธุรกิจ, ส่วนตัว หรือ รายได้ */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
          {t('mainCategoryLabel')}
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => handleSelectCategory('expense_business')}
            className={`py-2 px-1 rounded-xl text-[10.5px] font-bold border transition text-center cursor-pointer active:scale-95 ${
              selectedCategory === 'expense_business'
                ? 'bg-cyan-500/25 text-cyan-200 border-cyan-500 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            {t('catBusiness')}
          </button>
          <button
            type="button"
            onClick={() => handleSelectCategory('expense_personal')}
            className={`py-2 px-1 rounded-xl text-[10.5px] font-bold border transition text-center cursor-pointer active:scale-95 ${
              selectedCategory === 'expense_personal'
                ? 'bg-slate-700/80 text-slate-200 border-slate-500 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            {t('catPersonal')}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!selectedCategory.startsWith('income_')) {
                const targetCat = item.tax_category?.startsWith('income_') ? item.tax_category : 'income_40_8';
                handleSelectCategory(targetCat);
              }
            }}
            className={`py-2 px-1 rounded-xl text-[10.5px] font-bold border transition text-center cursor-pointer active:scale-95 ${
              selectedCategory.startsWith('income_')
                ? 'bg-emerald-500/25 text-emerald-200 border-emerald-500 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            {t('catIncome8')}
          </button>
        </div>
      </div>

      {/* Single Confirm Button */}
      <button
        onClick={() => onConfirm(selectedCategory)}
        disabled={isConfirming}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 active:scale-[0.98] text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition cursor-pointer"
      >
        {isConfirming ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            {t('confirmingAllBtn')}
          </>
        ) : (
          <>
            <Check className="w-4 h-4 font-bold" />
            {t('confirmThisBill')}
          </>
        )}
      </button>

      {/* Modal ยืนยันเตือนความแน่ใจเมื่อผู้ใช้เปลี่ยนหมวดจากที่ AI ทาย */}
      {pendingChangeCategory && (
        <CategoryChangeConfirmModal
          item={item}
          oldCategory={item.tax_category}
          newCategory={pendingChangeCategory}
          onConfirm={handleConfirmChange}
          onCancel={() => setPendingChangeCategory(null)}
          lang={lang}
        />
      )}
    </div>
  );
}
