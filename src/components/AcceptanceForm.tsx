import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import SignaturePad from "./SignaturePad";
import dfLogo from "@/assets/df-logo.png";
import { CheckSquare, Square, FileDown } from "lucide-react";
import { toast } from "sonner";

const AcceptanceForm = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const [customerAddress, setCustomerAddress] = useState("");
  const [installerName, setInstallerName] = useState("");
  const [installDate, setInstallDate] = useState({ year: "", month: "", day: "" });
  const [inspectionChecks, setInspectionChecks] = useState([false, false, false, false, false]);
  const [habitChecks, setHabitChecks] = useState([false, false, false]);
  const [signature, setSignature] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [signDate, setSignDate] = useState(() => {
    const now = new Date();
    return {
      year: String(now.getFullYear()),
      month: String(now.getMonth() + 1),
      day: String(now.getDate()),
    };
  });
  const [exporting, setExporting] = useState(false);

  const toggleInspection = (i: number) => {
    const next = [...inspectionChecks];
    next[i] = !next[i];
    setInspectionChecks(next);
  };

  const toggleHabit = (i: number) => {
    const next = [...habitChecks];
    next[i] = !next[i];
    setHabitChecks(next);
  };

  const allChecked = inspectionChecks.every(Boolean) && habitChecks.every(Boolean);

  const exportPDF = async () => {
    if (!allChecked) {
      toast.error("請先完成所有剔選項目才可匯出 PDF");
      return;
    }
    if (!formRef.current) return;
    setExporting(true);
    try {
      // Wait a tick so the signature image renders in DOM
      await new Promise((r) => setTimeout(r, 100));

      const canvas = await html2canvas(formRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#fff",
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgRatio = canvas.width / canvas.height;
      const pageRatio = pdfWidth / pdfHeight;

      let finalWidth = pdfWidth;
      let finalHeight = pdfWidth / imgRatio;

      // Scale to fit within one A4 page
      if (finalHeight > pdfHeight) {
        finalHeight = pdfHeight;
        finalWidth = pdfHeight * imgRatio;
      }

      const xOffset = (pdfWidth - finalWidth) / 2;
      pdf.addImage(imgData, "PNG", xOffset, 0, finalWidth, finalHeight);
      pdf.save("防貓安全工程驗收與交接單.pdf");
    } finally {
      setExporting(false);
    }
  };

  const inspectionItems = [
    { title: "1. 結構穩固", desc: "師傅用手拉扯網身及框架，確保無鬆動、無移位。" },
    { title: "2. 鎖扣功能", desc: "現場開關所有鎖扣，確保「咔」一聲完全到位。" },
    { title: "3. 縫隙安全", desc: "檢查所有邊緣位置，確保無任何貓頭可鑽出之大縫隙。" },
    { title: "4. 親手操作（最重要）", desc: "客戶親自操作開關和鎖扣兩次，確認掌握使用和鎖扣用法。" },
    { title: "5. 磁吸海報", desc: "已將「安全守護」磁吸海報貼於雪櫃或派發，並向全家講解用法。" },
  ];

  const habitItems = [
    "【主子美甲】：定期幫貓貓剪指甲，減少攀爬網面的衝動。",
    "【通風智慧】：無人在家時，養成「只留通風縫、不開大門窗」的習慣，並確認鎖扣已扣好。",
    "【全家共識】：教導全家人（及留意屋企狗狗）正確操作鎖扣，避免因貪玩或誤觸而開啟貓網。",
  ];

  const CheckBox = ({ checked, onClick }: { checked: boolean; onClick: () => void }) => (
    <button type="button" onClick={onClick} className="flex-shrink-0">
      {checked ? (
        <CheckSquare className="w-6 h-6 text-check-accent" />
      ) : (
        <Square className="w-6 h-6 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Export button */}
        <div className="flex justify-end print:hidden">
          <button
            onClick={exportPDF}
            disabled={exporting}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md font-medium transition-opacity ${
              allChecked
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            } disabled:opacity-50`}
          >
            <FileDown className="w-4 h-4" />
            {exporting ? "匯出中..." : "匯出 PDF"}
          </button>
        </div>

        {/* Form content */}
        <div ref={formRef} className="bg-card rounded-lg shadow-md border border-border p-6 md:p-8 space-y-5">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-3">
              <div className="bg-white rounded-lg p-1">
                <img src={dfLogo} alt="DF Logo" className="h-12 w-12 object-contain" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">DF創意家居</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground pt-2 whitespace-nowrap">
              防貓安全工程驗收與交接單
            </h1>
          </div>

          {/* 第一部分 */}
          <section>
            <div className="section-header">第一部分：基本資料</div>
            <div className="border border-t-0 border-border rounded-b-md p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="font-medium w-24 flex-shrink-0">客戶地址：</label>
                <input
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="flex-1 border-b border-border bg-transparent py-2 px-2 leading-relaxed focus:outline-none focus:border-primary"
                  placeholder="請輸入地址"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="font-medium w-24 flex-shrink-0">安裝師傅：</label>
                <input
                  value={installerName}
                  onChange={(e) => setInstallerName(e.target.value)}
                  className="flex-1 border-b border-border bg-transparent py-2 px-2 leading-relaxed focus:outline-none focus:border-primary"
                  placeholder="請輸入師傅姓名"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="font-medium w-24 flex-shrink-0">安裝日期：</label>
                <div className="flex items-center gap-1">
                  <input value={installDate.year} onChange={(e) => setInstallDate({ ...installDate, year: e.target.value })} className="w-16 border-b border-border bg-transparent py-2 px-1 leading-relaxed text-center focus:outline-none focus:border-primary" placeholder="年" />
                  <span>年</span>
                  <input value={installDate.month} onChange={(e) => setInstallDate({ ...installDate, month: e.target.value })} className="w-12 border-b border-border bg-transparent py-2 px-1 leading-relaxed text-center focus:outline-none focus:border-primary" placeholder="月" />
                  <span>月</span>
                  <input value={installDate.day} onChange={(e) => setInstallDate({ ...installDate, day: e.target.value })} className="w-12 border-b border-border bg-transparent py-2 px-1 leading-relaxed text-center focus:outline-none focus:border-primary" placeholder="日" />
                  <span>日</span>
                </div>
              </div>
            </div>
          </section>

          {/* 第二部分 */}
          <section>
            <div className="section-header text-base">第二部分：現場驗收項目 (師傅演示，客戶確認)</div>
            <div className="border border-t-0 border-border rounded-b-md divide-y divide-border">
              <div className="grid grid-cols-[1fr_auto] font-semibold text-sm bg-muted px-4 py-2">
                <span>驗收項目 / 檢查動作</span>
                <span className="w-16 text-center">確認</span>
              </div>
              {inspectionItems.map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto] items-center px-4 py-2.5">
                  <div>
                    <span className="font-medium text-sm">{item.title}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <div className="w-16 flex justify-center">
                    <CheckBox checked={inspectionChecks[i]} onClick={() => toggleInspection(i)} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 第三部分 */}
          <section>
            <div className="section-header text-base">第三部分：全家動員．守護主子</div>
            <div className="border border-t-0 border-border rounded-b-md p-4 space-y-2">
              <p className="text-xs text-muted-foreground">
                為了確保家中每位成員（包括長輩、小朋友及家傭姐姐）都能成為主子的「安全守護員」，本人同意配合以下生活小習慣：
              </p>
              {habitItems.map((text, i) => (
                <div key={i} className="flex items-start gap-3 py-1">
                  <CheckBox checked={habitChecks[i]} onClick={() => toggleHabit(i)} />
                  <span className="text-xs leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 第四部分 */}
          <section>
            <div className="section-header text-base">第四部分：安全守護承諾</div>
            <div className="border border-t-0 border-border rounded-b-md p-4 space-y-3">
              <p className="text-xs text-muted-foreground italic">
                這份工程凝聚了 DF 對生命的尊重，為了讓這份守護長久有效，我們與客戶達成以下承諾：
              </p>
              <div className="space-y-2 text-xs leading-relaxed">
                <div>
                  <span className="font-semibold text-foreground">工藝認可：</span>
                  <span className="text-foreground"> 本人已現場檢查所有安裝位置，確認 DF 的安裝專業、穩固且狀態良好，滿意交接。</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground">正確使用之必要：</span>
                  <span className="text-foreground"> 本人明白，防貓網的終極守護力源於「正確鎖上」。為保障貓咪安全，本人承諾會正確操作鎖扣。若因人為疏忽（如忘記扣鎖）、自行改裝或鋁窗本身結構老化而引發意外，本人理解這超出了 DF 的安裝保修範圍。</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground">長期維護：</span>
                  <span className="text-foreground"> 本人會將「磁吸安全提示卡」貼於明顯位置，並定期進行簡單自檢。如發現任何使用疑問或損壞，會立即停用該窗戶並聯絡 DF 專業團隊支援。</span>
                </div>
              </div>

              {/* Signature */}
              <div className="border-t border-border pt-3 space-y-3">
                <SignaturePad label="客戶簽署：" onSignatureChange={setSignature} />
                {/* Render signature as img for PDF capture */}
                {signature && (
                  <img src={signature} alt="客戶簽名" className="hidden" id="signature-preview" />
                )}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="font-medium text-sm w-24 flex-shrink-0">客戶姓名：</label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="flex-1 border-b border-border bg-transparent py-2 px-2 leading-relaxed text-sm focus:outline-none focus:border-primary"
                    placeholder="請輸入客戶姓名"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-medium text-sm">日期：</label>
                  <input value={signDate.year} onChange={(e) => setSignDate({ ...signDate, year: e.target.value })} className="w-16 border-b border-border bg-transparent py-2 px-1 leading-relaxed text-center text-sm focus:outline-none focus:border-primary" placeholder="年" />
                  <span className="text-sm">年</span>
                  <input value={signDate.month} onChange={(e) => setSignDate({ ...signDate, month: e.target.value })} className="w-12 border-b border-border bg-transparent py-2 px-1 leading-relaxed text-center text-sm focus:outline-none focus:border-primary" placeholder="月" />
                  <span className="text-sm">月</span>
                  <input value={signDate.day} onChange={(e) => setSignDate({ ...signDate, day: e.target.value })} className="w-12 border-b border-border bg-transparent py-2 px-1 leading-relaxed text-center text-sm focus:outline-none focus:border-primary" placeholder="日" />
                  <span className="text-sm">日</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AcceptanceForm;
