# 📜 HIẾN PHÁP GIT & GITHUB WORKFLOW (PHARMAASSIST)

> Quy trình làm việc nhóm và tương tác với AI Assistant thông qua Git/GitHub, đảm bảo an toàn mã nguồn và lịch sử commit sạch sẽ.

---

## 1. MÔ HÌNH NHÁNH (BRANCHING MODEL)
Dự án áp dụng mô hình **Git Flow rút gọn**:
- 🔴 **`main`**: Code ổn định nhất, dùng để deploy/nộp bài. **Không code trực tiếp.** Chỉ nhận code từ `release/*` hoặc `hotfix/*`.
- 🟡 **`develop`**: Nhánh tích hợp (Integration Branch). Mọi nhánh tính năng đều tạo ra từ đây và gộp về đây.
- 🟢 **`feature/PAC-xxx-slug`**: Phát triển tính năng mới (ví dụ: `feature/PAC-12-login-page`).
- 🟠 **`fix/PAC-xxx-slug`** hoặc **`bugfix/PAC-xxx-slug`**: Sửa lỗi trong phát triển.
- 🔵 **`docs/PAC-xxx-slug`**: Viết tài liệu/UML.
- 🟣 **`release/vX.Y`**: Chuẩn bị demo/nộp bài. Tạo từ `develop`, merge vào `main` và `develop` sau khi ổn định.
- 🔴 **`hotfix/vX.Y.Z`**: Sửa lỗi khẩn cấp trên production/main. Tạo từ `main`, merge vào cả `main` và `develop`.

---

## 2. QUY TRÌNH LÀM VIỆC HẰNG NGÀY

### 2.1. Mô Hình Shared Repository (Dành cho thành viên có quyền ghi trực tiếp)
```bash
# Bước 1: Đồng bộ local develop với remote mới nhất
git checkout develop && git pull origin develop

# Bước 2: Tạo nhánh mới từ develop mới nhất
git checkout -b feature/PAC-xxx-ten-chuc-nang

# Bước 3: Code và kiểm tra local (chạy npm run dev, test, lint...)

# Bước 4: Cập nhật code mới nhất từ develop bằng Rebase (để giữ lịch sử sạch)
git fetch origin
git rebase origin/develop

# Bước 5: Lưu thay đổi (Commit theo chuẩn Conventional Commits)
git add .
git commit -m "feat(PAC-xxx): add payment flow"

# Bước 6: Đẩy nhánh lên GitHub
git push -u origin feature/PAC-xxx-ten-chuc-nang

# Bước 7: Tạo Pull Request (PR) trên GitHub
# Chọn luồng merge: feature/PAC-xxx-ten-chuc-nang ➡️ develop (Tuyệt đối KHÔNG merge thẳng vào main)
```

### 2.2. Mô Hình Forking Workflow (Dành cho thành viên fork dự án)
* **`upstream`**: Repository gốc (`https://github.com/TwotNguyenVN/PharmaAssist.git`)
* **`origin`**: Repository cá nhân đã fork (`https://github.com/<username>/PharmaAssist.git`)

```bash
# Cấu hình remote ban đầu (chỉ thực hiện 1 lần duy nhất sau khi clone)
git remote add upstream https://github.com/TwotNguyenVN/PharmaAssist.git

# Bước 1: Đồng bộ local develop với upstream mới nhất
git checkout develop && git pull upstream develop

# Bước 2: Tạo nhánh mới từ develop
git checkout -b feature/PAC-xxx-ten-chuc-nang

# Bước 3: Code và kiểm tra local

# Bước 4: Cập nhật code mới từ upstream bằng Rebase trước khi push
git fetch upstream
git rebase upstream/develop

# Bước 5: Lưu thay đổi (Commit theo chuẩn Conventional Commits)
git add .
git commit -m "feat(PAC-xxx): add payment flow"

# Bước 6: Đẩy nhánh lên repository cá nhân đã fork (origin)
git push -u origin feature/PAC-xxx-ten-chuc-nang

# Bước 7: Tạo Pull Request từ repo fork cá nhân sang repo gốc
# Chọn luồng merge: member-username/PharmaAssist:feature/PAC-xxx ➡️ TwotNguyenVN/PharmaAssist:develop
```

### 2.3. Đối với Trưởng nhóm (Leader)
- Bảo vệ nhánh `main` và `develop` trên GitHub (Require PR, require approvals, block direct push).
- Review PR, kiểm tra conflict, chạy test tích hợp và thực hiện merge trên GitHub Web.
- Gộp `release/*` / `hotfix/*` vào `main`, tạo Git Tag tương ứng (ví dụ: `v1.0`, `v1.0.1`) và đồng bộ ngược về `develop`.
- **Đồng bộ ngược khi develop đi sau main (behind main):**
  ```bash
  git checkout develop && git fetch origin
  git merge origin/main && git push origin develop
  ```

---

## 3. NGUYÊN TẮC VÀNG KHI PUSH & COMMIT
1. **Kiểm tra biên dịch & lint local**: Chạy build/lint trước khi push. Tuyệt đối không push code lỗi biên dịch.
2. **Tuyệt đối KHÔNG dùng Force Push (`git push -f`)**: Không force push trên các nhánh dùng chung (`main`, `develop`).
3. **Kéo code trước khi đẩy**: Luôn pull trước khi push để giải quyết xung đột ở local.
4. **Bảo mật**: Không push file nhạy cảm (`.env`, credentials, node_modules, build artifacts). Cập nhật đầy đủ `.gitignore`.
5. **Conventional Commits**: Định dạng commit: `<type>(PAC-xxx): <description>` (Ví dụ: `feat(PAC-12): add Google login button`).
   - Các type: `feat` (tính năng), `fix` (sửa lỗi), `docs` (tài liệu), `style` (giao diện/format), `refactor` (tối ưu code), `chore` (cấu hình/package).

---

## 4. XỬ LÝ XUNG ĐỘT (CONFLICTS)
- Xảy ra khi nhiều người sửa cùng một vùng code. 
- Tìm các file bị xung đột (có ký tự `<<<<<<<`, `=======`, `>>>>>>>`).
- Sử dụng công cụ VS Code/IDE để chọn:
  - **Accept Current Change**: Giữ code local của bạn.
  - **Accept Incoming Change**: Giữ code kéo từ remote về.
  - **Accept Both Changes**: Giữ và kết hợp cả hai.
- **Lưu ý:** Không chọn bừa nếu chưa hiểu code. Hãy trao đổi với người viết đoạn code đó để cùng giải quyết. Sau khi sửa xong:
  ```bash
  git add .
  git commit -m "chore(PAC-xxx): resolve merge conflicts"
  git push
  ```

---

## 5. QUY TRÌNH GIT DÀNH RIÊNG CHO AI ASSISTANT (ANTIGRAVITY)
> Quy tắc bắt buộc AI Assistant tuân thủ để tránh làm hỏng repository chung và đảm bảo tính kiểm duyệt của nhóm.

1. **Mỗi tác vụ một nhánh riêng**: Luôn checkout nhánh mới từ `develop` mới nhất dựa theo mã Jira issue key (`PAC-xxx`) được phân tích hoặc cung cấp.
2. **Không tự ý commit/push**: AI chỉ chỉnh sửa code trên local. Chỉ commit/push khi có lệnh rõ ràng từ người dùng (`"push lên GitHub"`, `"đẩy code"`, `"tạo PR"`).
3. **Tuyệt đối không tự ý merge**: AI không dùng lệnh git merge ở local để gộp nhánh của mình vào `develop` hay `main`. Chỉ push nhánh feature lên GitHub và hướng dẫn người dùng tạo PR.
4. **Xử lý lệch code/xung đột khi develop trên GitHub thay đổi trước khi push**:
  ```bash
  # 1. Commit tạm trên nhánh feature local
  git add . && git commit -m "feat(PAC-xxx): temporary commit before update"
  # 2. Fetch develop mới nhất và merge vào nhánh feature local để giải quyết xung đột
  git fetch origin && git merge origin/develop
  # 3. (Nếu có conflict) AI tự động phân tích và sửa các file xung đột một cách hợp lý
  git add . && git commit -m "fix(PAC-xxx): resolve conflict with develop"
  # 4. Push nhánh feature hoàn chỉnh và hướng dẫn người dùng tạo PR trên GitHub Web
  git push origin feature/PAC-xxx-slug
  ```

---

## 6. THAM CHIẾU NHANH CÁC LỆNH GIT

| Thao tác | Lệnh thực hiện |
| :--- | :--- |
| Kiểm tra trạng thái | `git status` |
| Cập nhật code develop | `git checkout develop && git pull origin develop` |
| Tạo nhánh feature | `git checkout -b feature/PAC-xxx-slug` |
| Lưu thay đổi (Commit) | `git add . && git commit -m "feat(PAC-xxx): description"` |
| Đẩy code (Push) | `git push -u origin feature/PAC-xxx-slug` |
| Đồng bộ develop vào feature | `git fetch origin && git merge origin/develop` |
| Cất code tạm thời | `git stash` ➡️ `git stash pop` (lấy ra lại) |
| Xem lịch sử rút gọn | `git log --oneline -n 10` |
