# Chức năng Chấm Lại (Re-grading) với Moderator

## Tổng quan

Hệ thống cho phép Manager assign Moderator (Second Examiner) để chấm lại các submissions có điểm thấp hoặc có vi phạm.

## Workflow

```
1. Student nộp bài → Teacher chấm → Submission có điểm (có thể thấp/0 điểm)
2. Manager xem danh sách submissions cần chấm lại
3. Manager assign Moderator cho submission đó
4. Moderator vào dashboard của mình → Xem bài được assign → Chấm lại
5. Điểm được cập nhật vào database
```

## Components đã tạo

### 1. **RegradeManagement.js** (Manager view)
- **Path**: `src/pages/RegradeManagement.js`
- **Chức năng**:
  - Hiển thị danh sách submissions cần chấm lại (điểm ≤ 3 hoặc có vi phạm)
  - Lọc theo trạng thái: Tất cả / Chưa assign / Đã assign
  - Assign Moderator cho từng submission
  - Stats dashboard: Tổng số, Chưa assign, Đã assign

### 2. **AssignModeratorModal.js** (Modal component)
- **Path**: `src/components/AssignModeratorModal.js`
- **Chức năng**:
  - Modal để chọn Moderator
  - Hiển thị thông tin submission (Student, Score, Violations)
  - Dropdown list các Teachers/Moderators
  - Submit để assign

### 3. **ModeratorDashboard.js** (Moderator view)
- **Path**: `src/pages/ModeratorDashboard.js`
- **Chức năng**:
  - Dashboard cho Moderator xem các submissions được assign
  - Hiển thị thống kê: Tổng submissions, Chưa hoàn thành, Đã hoàn thành
  - Table danh sách submissions với nút "Chấm lại"
  - Click "Chấm lại" → Navigate to GradingPage

## API Services

### submissionService.js - New Functions

#### 1. `assignModerator(submissionId, moderatorId)`
```javascript
// Assign moderator (SecondExaminerId) to submission
await submissionService.assignModerator(submissionId, moderatorId);
```

#### 2. `getSubmissionsNeedingRegrade()`
```javascript
// Get submissions with score ≤ 3 or has violations
const submissions = await submissionService.getSubmissionsNeedingRegrade();
```

#### 3. `getSubmissionsByModerator(moderatorId)`
```javascript
// Get submissions where user is SecondExaminerId
const submissions = await submissionService.getSubmissionsByModerator(userId);
```

## Database Schema

### Submission Table (Backend)
```csharp
public class Submission
{
    public Guid SubmissionId { get; set; }
    public Guid ExamId { get; set; }
    public string StudentId { get; set; }
    public Guid ExaminerId { get; set; }
    public Guid? SecondExaminerId { get; set; }  // ← Moderator ID
    public string FilePath { get; set; }
    public decimal? TotalScore { get; set; }
    public string GradingStatus { get; set; }
    // ... other fields
}
```

### UpdateSubmissionRequest
```csharp
public class UpdateSubmissionRequest
{
    public Guid? ExamId { get; set; }
    public Guid? SecondExaminerId { get; set; }  // ← Update this to assign
    public string? StudentId { get; set; }
    public string? GradingStatus { get; set; }
    public decimal? TotalScore { get; set; }
}
```

## Routes

### App.js Routes Updated

```javascript
/moderator → ModeratorDashboard (cho teacher/moderator role)
/grading/:examId → GradingPage (cho teacher và moderator)
/grading/:examId/submission/:submissionId → GradingPage (cho cả 2 roles)
```

## Cách sử dụng

### Manager (Assign Moderator):
1. Login với role **Manager**
2. Click tab **"Chấm lại"** trong Manager Dashboard
3. Xem danh sách submissions có điểm thấp
4. Click **"Assign Moderator"** trên submission cần chấm lại
5. Chọn Teacher/Moderator từ dropdown
6. Click **"Assign Moderator"** để confirm

### Moderator (Chấm lại):
1. Login với role **Moderator** hoặc **Teacher** được assign
2. Vào **Moderator Dashboard** (route `/moderator`)
3. Xem danh sách submissions được assign
4. Click **"Chấm lại"** trên submission cần chấm
5. Chấm điểm như bình thường trong GradingPage
6. Điểm sẽ được cập nhật vào database

## Testing

### 1. Test Assign Moderator:
```javascript
// Manager Dashboard → Tab "Chấm lại"
// Kiểm tra danh sách submissions có điểm ≤ 3
// Assign moderator và verify trong database
```

### 2. Test Moderator View:
```javascript
// Login as moderator
// Check ModeratorDashboard shows correct submissions
// Verify chỉ hiển thị submissions có SecondExaminerId = userId
```

### 3. Test Re-grading:
```javascript
// Moderator click "Chấm lại"
// Navigate to GradingPage
// Change scores
// Verify TotalScore updated in database
```

## API Endpoints (Backend)

```
PUT /api/v1/submission/{id}/update
Body: { SecondExaminerId: "guid" }

GET /api/v1/submission
Returns: All submissions (filter client-side for SecondExaminerId)
```

## Tính năng nâng cao có thể thêm

### 1. Email Notification
- Send email to Moderator khi được assign
- Notify Manager khi Moderator hoàn thành chấm lại

### 2. History Tracking
- Lưu lịch sử ai chấm lần 1, ai chấm lại
- Compare scores giữa 2 lần chấm

### 3. Approval Workflow
- Manager approve điểm sau khi Moderator chấm lại
- Set `IsApproved = true` after re-grading

### 4. Bulk Assign
- Assign nhiều submissions cho 1 Moderator cùng lúc
- Auto-assign based on workload balancing

## Files Structure

```
src/
├── components/
│   ├── AssignModeratorModal.js
│   └── AssignModeratorModal.css
├── pages/
│   ├── RegradeManagement.js
│   ├── RegradeManagement.css
│   ├── ModeratorDashboard.js
│   ├── ModeratorDashboard.css
│   └── ManagerDashboard.js (updated)
├── services/
│   └── submissionService.js (updated)
└── App.js (updated with new routes)
```

## Troubleshooting

### Issue: Moderator không thấy submissions
**Fix**: Check SecondExaminerId trong database có match với userId không

### Issue: Assign không thành công
**Fix**: Verify UpdateSubmissionRequest backend accepts SecondExaminerId

### Issue: Điểm không update sau khi chấm lại
**Fix**: Check TotalScore calculation trong GradingPage có update correctly không

## Notes

- **SecondExaminerId** là nullable → Có thể null khi chưa assign
- **Role**: Backend có thể chỉ có role "Teacher", frontend sử dụng SecondExaminerId để identify moderator
- **GradingPage**: Dùng chung cho cả Teacher và Moderator, không cần modify nhiều
- **Permissions**: Moderator chỉ thấy submissions được assign, không thấy tất cả

## Completed ✅

- [x] Backend có sẵn SecondExaminerId field
- [x] Created RegradeManagement component
- [x] Created AssignModeratorModal component  
- [x] Created ModeratorDashboard component
- [x] Updated submissionService with new APIs
- [x] Updated App.js with new routes
- [x] Updated ManagerDashboard với tab "Chấm lại"
- [x] Styling cho tất cả components

## Next Steps (Optional)

1. Test toàn bộ workflow end-to-end
2. Add notification system
3. Add history tracking
4. Implement approval workflow
5. Add bulk assignment feature
