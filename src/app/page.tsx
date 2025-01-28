'use client'; // ระบุว่าโค้ดนี้ทำงานใน client-side

import { useEffect, useState } from 'react';
import Menu from "@/components/menu";

export default function App() {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID || ''; // ถ้าไม่ได้กำหนด liffId จะใช้ค่าเป็น string ว่าง
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInLine, setIsInLine] = useState(false); // สถานะการเปิดใน LINE

  useEffect(() => {
    const loadLiff = async () => {
      const liff = (await import('@line/liff')).default;
      try {
        // ตรวจสอบว่าแอปอยู่ใน LINE Webview โดยการตรวจสอบ userAgent
        const userAgent = window.navigator.userAgent;
        if (!userAgent.includes("Line")) {
          setIsInLine(false); // หากไม่อยู่ใน LINE Webview
          return; // หยุดการทำงาน
        } else {
          setIsInLine(true); // หากอยู่ใน LINE Webview
        }

        // ตรวจสอบว่า liffId มีค่าไหม
        if (!liffId) {
          throw new Error('LIFF ID is missing');
        }

        // เริ่มต้น LIFF
        await liff.init({ liffId });

        // ตรวจสอบสถานะการล็อกอิน
        if (liff.isLoggedIn()) {
          setIsLoggedIn(true); // หากล็อกอินแล้ว
        } else {
          liff.login(); // หากยังไม่ได้ล็อกอิน ให้ทำการล็อกอิน
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('LIFF initialization error:', error.message); // ตรวจสอบประเภทของ error
        } else {
          console.error('Unknown error during LIFF initialization');
        }
      }
    };

    loadLiff();
  }, [liffId]); // เพิ่ม liffId ใน dependency เพื่อให้ทำงานทุกครั้งที่ค่า liffId เปลี่ยนแปลง

  // หากไม่อยู่ใน LINE Webview ให้แสดงข้อความว่า "โปรดเปิดแอปใน LINE" และเพิ่มลิงก์ให้เปิดแอป LINE
  if (!isInLine) {
    return (
      <div className="flex justify-center items-center w-full h-screen">
        <p>
          โปรดเปิดแอปใน LINE
          <a href="https://line.me/ti/p/@256cnraq" className="text-blue-500 underline ml-2">
            เปิดแอป LINE
          </a>
        </p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex justify-center items-center w-full h-screen">
        <p>กำลังเข้าสู่ระบบ...</p>
      </div>
    );
  }

  return (
    <section className="relative flex justify-center items-center bg-backgroundImg bg-repeat bg-cover bg-bottom w-full h-screen p-4">
      <Menu />
    </section>
  );
}
