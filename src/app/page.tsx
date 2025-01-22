'use client'; // ระบุว่าโค้ดนี้ทำงานใน client-side

import { useEffect, useState } from 'react';
import Menu from "@/components/menu";

export default function App() {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID || ''; // ถ้าไม่ได้กำหนด liffId จะใช้ค่าเป็น string ว่าง
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // โหลด LIFF SDK
    const loadLiff = async () => {
      const liff = (await import('@line/liff')).default;
      try {
        // ตรวจสอบว่า liffId มีค่าไหม
        if (!liffId) {
          throw new Error('LIFF ID is missing');
        }

        // เริ่มต้น LIFF
        await liff.init({ liffId });

        // ตรวจสอบสถานะการล็อกอิน
        if (liff.isLoggedIn()) {
          setIsLoggedIn(true); // หากล็อกอินแล้ว
          // บันทึกสถานะการล็อกอินใน LocalStorage
          localStorage.setItem('isLoggedIn', 'true');
        } else {
          // ถ้ายังไม่ล็อกอิน, ล็อกอิน
          liff.login();
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('LIFF initialization error:', error.message); // ตรวจสอบประเภทของ error
        } else {
          console.error('Unknown error during LIFF initialization');
        }
      }
    };

    // ตรวจสอบสถานะการล็อกอินจาก LocalStorage ก่อน
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    if (loggedInStatus === 'true') {
      setIsLoggedIn(true);
    } else {
      loadLiff(); // ถ้าไม่ได้ล็อกอิน, ทำการเรียกฟังก์ชัน loadLiff()
    }
  }, [liffId]); // เพิ่ม liffId ใน dependency เพื่อให้ทำงานทุกครั้งที่ค่า liffId เปลี่ยนแปลง

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
