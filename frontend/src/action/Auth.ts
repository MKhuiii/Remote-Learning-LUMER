// // Định nghĩa kiểu dữ liệu trả về từ API (tùy chọn nhưng khuyến khích dùng trong TS)
// export interface AuthResponse {
//   ok: boolean;
//   status: number;
//   data: any;
// }

// // ------------------ Action Đăng Ký ----------------------
// export const registerUser = async (name: string, email: string, password: string): Promise<AuthResponse> => {
//   try {
//     const response = await fetch('http://127.0.0.1:8000/register', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         username: name,
//         email: email,
//         password: password,
//       }),
//     });

//     const data = await response.json();
//     return { ok: response.ok, status: response.status, data };
//   } catch (error) {
//     console.error("Lỗi kết nối API Register:", error);
//     throw new Error('Không thể kết nối đến Server Backend!');
//   }
// };

// // ------------------ Action Đăng Nhập ----------------------
// export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
//   try {
//     const formData = new URLSearchParams();
//     formData.append("username", email); // OAuth2 định dạng field bắt buộc là username
//     formData.append("password", password);

// const response = await fetch("http://127.0.0.1:8000/login", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/x-www-form-urlencoded",
//   },
//   credentials: "include",
//   body: formData.toString(),
// });

//     const data = await response.json();
//     return { ok: response.ok, status: response.status, data };
//   } catch (error) {
//     console.error("Lỗi kết nối API Login:", error);
//     throw new Error('Không thể kết nối đến Server Backend!');
//   }
// };