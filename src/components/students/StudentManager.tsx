import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Trash2, AlertCircle, Sparkles } from "lucide-react";
import { useI18n } from "@/i18n";
import { useAuth } from "@/hooks/useAuth";
import { DbStudent, addStudent, removeStudent, addSurvey, updateSurveyAnalysis, setAttendance } from "@/lib/database";
import { generateDemoSurveyAnswers, generateDemoAnalysis, generateDemoAttendanceDates } from "@/lib/demoData";
import { toast } from "sonner";

interface StudentManagerProps {
  students: DbStudent[];
  onStudentsChange: () => void;
  selectedStudent: DbStudent | null;
  onSelectStudent: (student: DbStudent | null) => void;
  overrideTeacherId?: string;
}

export function StudentManager({ students, onStudentsChange, selectedStudent, onSelectStudent, overrideTeacherId }: StudentManagerProps) {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [age, setAge] = useState("5");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [seeding, setSeeding] = useState(false);

  const demoStudents = [
    { name: locale === "ar" ? "أحمد محمد" : "Ahmad Mohammed", age: 5, gender: "male" },
    { name: locale === "ar" ? "فاطمة علي" : "Fatima Ali", age: 4, gender: "female" },
    { name: locale === "ar" ? "يوسف خالد" : "Yousef Khaled", age: 6, gender: "male" },
    { name: locale === "ar" ? "نورة سعد" : "Noura Saad", age: 5, gender: "female" },
    { name: locale === "ar" ? "عمر حسن" : "Omar Hassan", age: 4, gender: "male" },
    { name: locale === "ar" ? "ريم عبدالله" : "Reem Abdullah", age: 5, gender: "female" },
  ];

  const handleSeedDemo = async () => {
    const effectiveTeacherId = overrideTeacherId || user?.id;
    if (!effectiveTeacherId || students.length > 0) return;
    setSeeding(true);
    try {
      for (const s of demoStudents) {
        const student = await addStudent(s, effectiveTeacherId);
        if (!student) continue;

        // Add 2 surveys with AI analysis for each student
        for (let i = 0; i < 2; i++) {
          const answers = generateDemoSurveyAnswers();
          const survey = await addSurvey({ student_id: student.id, teacher_id: effectiveTeacherId, answers });
          if (survey) {
            const analysis = generateDemoAnalysis(student.name, answers);
            await updateSurveyAnalysis(survey.id, analysis);
          }
        }

        // Add attendance records
        const attendanceRecords = generateDemoAttendanceDates();
        for (const rec of attendanceRecords) {
          await setAttendance(student.id, rec.date, rec.status, effectiveTeacherId);
        }
      }
      onStudentsChange();
      toast.success(locale === "ar" ? "تمت إضافة بيانات تجريبية شاملة مع استقصاءات وحضور 🎉" : "Full demo data added with surveys & attendance 🎉");
    } catch (e) {
      console.error("Seed error:", e);
      toast.error(locale === "ar" ? "خطأ في إضافة البيانات" : "Error adding demo data");
    }
    setSeeding(false);
  };

  const handleAdd = async () => {
    const effectiveTeacherId = overrideTeacherId || user?.id;
    if (!name.trim() || !effectiveTeacherId) return;
    if (students.length >= 30) {
      toast.error(t("students.max"));
      return;
    }
    const student = await addStudent({ name: name.trim(), age: parseInt(age), gender }, effectiveTeacherId);
    if (student) {
      setName("");
      onStudentsChange();
      toast.success(locale === "ar" ? `تمت إضافة ${student.name}` : `${student.name} added`);
    }
  };

  const handleRemove = async (id: string) => {
    await removeStudent(id);
    if (selectedStudent?.id === id) onSelectStudent(null);
    onStudentsChange();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>{t("students.title")}</span>
          <Badge variant="secondary" className="text-xs">{students.length}/30 {t("students.count")}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {students.length >= 30 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10 border border-warning/30 text-xs text-warning-foreground">
            <AlertCircle className="h-3 w-3" /> {t("students.max")}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <Input placeholder={t("students.name")} value={name} onChange={e => setName(e.target.value)} className="flex-1 min-w-[140px]" onKeyDown={e => e.key === "Enter" && handleAdd()} />
          <Select value={age} onValueChange={setAge}>
            <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[3, 4, 5, 6, 7].map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={gender} onValueChange={(v: "male" | "female") => setGender(v)}>
            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{t("students.male")}</SelectItem>
              <SelectItem value="female">{t("students.female")}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} size="sm" disabled={!name.trim() || students.length >= 30}>
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-6 space-y-3">
            <p className="text-sm text-muted-foreground">{t("students.noStudents")}</p>
            <Button variant="outline" size="sm" onClick={handleSeedDemo} disabled={seeding} className="gap-2">
              <Sparkles className="h-4 w-4" />
              {seeding ? (locale === "ar" ? "جاري الإضافة... ⏳" : "Adding...") : (locale === "ar" ? "✨ إضافة بيانات تجريبية شاملة" : "✨ Add Full Demo Data")}
            </Button>
          </div>
        ) : (
          <div className="space-y-1 max-h-[300px] overflow-auto">
            {students.map(student => (
              <div
                key={student.id}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors border ${selectedStudent?.id === student.id ? "bg-primary/10 border-primary/30" : "hover:bg-muted/50 border-transparent"}`}
                onClick={() => onSelectStudent(student)}
              >
                <span className="text-lg">{student.gender === "male" ? "👦" : "👧"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{student.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t("students.age")}: {student.age}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={e => { e.stopPropagation(); handleRemove(student.id); }}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
