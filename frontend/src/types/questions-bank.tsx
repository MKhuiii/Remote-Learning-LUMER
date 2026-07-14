export interface DapAnTracNghiem {
  id: string;
  noiDung: string;
}

export interface CauHoi {
  id: string;
  noiDung: string;

  module: string;

  loaiCauHoi: "Trắc nghiệm" | "Tự luận";

  mucDo: "Dễ" | "Trung bình" | "Khó";

  chuDe: string[];

  ngayTao: string;

  cacDapAn?: DapAnTracNghiem[];

  dapAnDungId?: string;

  huongDanTuLuan?: string;
}

export interface SubjectInfo {
  id: string;

  code: string;

  title: string;

  description: string;

  instructor: string;

  image: string;

  totalModules: number;

  totalQuestions: number;

  status: "Active" | "Inactive";
}
