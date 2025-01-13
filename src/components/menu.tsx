import Link from "next/link";

const Menu = () => {
  return (
    <div className="p-8 bg-blue-200 rounded-lg border-2 border-white w-full max-w-lg">
      {/* กรอบหัวข้อ */}
      <div className="text-center text-white text-xl font-bold mb-4">
        เลือกศิลปินที่ชื่นชอบ
      </div>

      {/* กรอบปุ่ม */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 13 }).map((_, index) => (
          <Link
            key={`artist-${index + 1}`} // Unique key for each Link
            href={`/live/${index + 1}`}
          >
            <div
              className="aspect-square bg-gray-300 rounded-xl flex justify-center items-center bg-cover bg-center cursor-pointer"
              style={{
                backgroundImage: `url('/images/bg-button/asset${String(
                  index + 1
                ).padStart(4, "0")}.jpg')`,
              }}
            >
              {/* Optional content */}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Menu;
