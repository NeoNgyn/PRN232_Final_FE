# Sample Files for Testing

Để test tính năng upload file RAR/ZIP, bạn cần tạo các file với tên theo format sau:

## Format tên file:
```
[MÔN]_[HỌC KỲ]_[LOẠI THI]_[SLOT]_[PASSWORD]_[TÊN SV]_[MSSV].docx
```

## Ví dụ file test cho kỳ thi SWD392_SU25_PE_Slot1:

1. `SWD392_SU25_PE_1_358715_Vu Trung Tin_SE161572.docx`
2. `SWD392_SU25_PE_1_358716_Nguyen Van A_SE161573.docx`
3. `SWD392_SU25_PE_1_358717_Tran Thi B_SE161574.docx`
4. `SWD392_SU25_PE_1_358718_Le Van C_SE161575.docx`
5. `SWD392_SU25_PE_1_358719_Pham Thi D_SE161576.docx`

## Bước tạo file test:

1. Tạo các file Word (.docx) với nội dung bất kỳ
2. Đặt tên file theo format trên
3. Nén tất cả file vào một file ZIP
4. Upload file ZIP trong trang Admin Dashboard

## Lưu ý:

- Hiện tại hệ thống chỉ hỗ trợ file ZIP (không hỗ trợ RAR)
- Nếu có file RAR, hãy giải nén và nén lại thành ZIP
- Tất cả thông tin trong tên file phải khớp với kỳ thi đã tạo:
  - Môn học: SWD392
  - Học kỳ: SU25
  - Loại thi: PE
  - Slot: 1

## File Excel tiêu chí chấm điểm mẫu:

Tạo file Excel với 3 cột:

| Tiêu chí | Điểm tối đa | Mô tả |
|----------|-------------|-------|
| Thiết kế kiến trúc hệ thống | 2 | Đánh giá khả năng thiết kế kiến trúc |
| Code quality và convention | 2 | Đánh giá chất lượng code |
| Implement features | 3 | Triển khai các tính năng |
| Database design | 2 | Thiết kế cơ sở dữ liệu |
| Documentation | 1 | Tài liệu hướng dẫn |

Tổng điểm: 10
