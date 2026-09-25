import { Suspense } from "react";
import LoginContent from "./LoginContent";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="login-page">
          <div className="login-wrapper">
            <section className="login-form-panel">
              <div className="form-header">
                <h2>กำลังโหลด...</h2>
                <p>กรุณารอสักครู่</p>
              </div>
            </section>
          </div>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}