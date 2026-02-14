import React from "react";
import styles from "./DieuKhoan.module.css";

export default function DieuKhoan() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Điều khoản & Chính sách</h1>

      <section className={styles.section}>
        <h2 className={styles.heading}>
          1. Chính sách bảo mật thông tin cá nhân
        </h2>
        <p>
          <strong>Mục đích thu thập thông tin:</strong> Chúng tôi thu thập thông
          tin cá nhân nhằm xác thực tài khoản, quản lý nạp xu, phần thưởng và
          cải thiện trải nghiệm người dùng.
        </p>
        <p>
          <strong>Loại thông tin thu thập:</strong> Họ tên, email, UID, thông
          tin thanh toán (ID giao dịch), hành vi sử dụng website.
        </p>
        <p>
          <strong>Phạm vi sử dụng:</strong> Dữ liệu chỉ dùng nội bộ và không
          chia sẻ bên thứ ba trừ khi có yêu cầu pháp lý.
        </p>
        <p>
          <strong>Thời gian lưu trữ:</strong> Đến khi tài khoản bị xóa hoặc
          người dùng yêu cầu.
        </p>
        <p>
          <strong>Quyền của người dùng:</strong> Yêu cầu xem, chỉnh sửa, xóa dữ
          liệu qua email hỗ trợ.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>2. Chính sách thanh toán</h2>
        <p>
          Chúng tôi sử dụng cổng thanh toán <strong>PayOS</strong> để xử lý các
          giao dịch nạp xu. Giao dịch được xử lý ngay sau khi xác nhận thành
          công.
        </p>
        <p>
          Chúng tôi không lưu thông tin thẻ ngân hàng, chỉ lưu ID giao dịch, số
          xu, thời gian nạp để đối soát.
        </p>
        <p>
          Mọi giao dịch được bảo mật qua giao thức SSL và tuân thủ quy định của
          PayOS.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>3. Chính sách hoàn tiền</h2>
        <p>Hoàn tiền chỉ hỗ trợ khi:</p>
        <ul>
          <li>Tiền bị trừ nhưng không cộng xu.</li>
          <li>Lỗi hệ thống phía chúng tôi.</li>
          <li>
            Hack hoặc xâm phạm tài khoản gây mất xu (xét duyệt từng trường hợp).
          </li>
        </ul>
        <p>
          Không hoàn tiền nếu người dùng đã tiêu xu hoặc thay đổi quyết định.
        </p>
        <p>Yêu cầu hoàn tiền gửi trong vòng 3 ngày kể từ giao dịch.</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>4. Chính sách giao nhận sản phẩm</h2>
        <p>
          <strong>Vật phẩm số:</strong> Giao ngay qua tài khoản sau khi mở khóa
          thành công.
        </p>
        <p>
          <strong>Phần thưởng hiện vật (nếu có):</strong> Liên hệ xác nhận địa
          chỉ, giao hàng trong 2-5 ngày qua đối tác vận chuyển uy tín.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>5. Quy chế hoạt động website</h2>
        <p>
          Website cung cấp nội dung truyện tranh kết hợp gamification (nhiệm vụ,
          xu, vật phẩm) dành cho thành viên đã đăng ký.
        </p>
        <ul>
          <li>Người dùng đăng ký tài khoản bằng email hoặc Google.</li>
          <li>Tuân thủ quy tắc cộng đồng và nội quy hoạt động.</li>
          <li>
            Xu dùng để mở khóa chương, nhận vật phẩm ảo, không quy đổi ra tiền.
          </li>
          <li>
            Cấm phá hoại hệ thống, gian lận, phát tán nội dung vi phạm pháp
            luật.
          </li>
          <li>
            Website bảo mật thông tin, minh bạch lịch sử giao dịch và hỗ trợ
            giải quyết tranh chấp.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>6. Thông tin liên hệ</h2>
        <p>
          <strong>Đơn vị quản lý:</strong> [Tên tổ chức hoặc cá nhân]
        </p>
        <p>
          <strong>Địa chỉ:</strong> [Địa chỉ cư trú / kinh doanh]
        </p>
        <p>
          <strong>Email hỗ trợ:</strong> [email hỗ trợ]
        </p>
        <p>
          <strong>Hotline:</strong> [số điện thoại]
        </p>
      </section>
    </div>
  );
}
