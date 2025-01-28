"use client";
import React from "react";
import { useRouter } from "next/navigation";

type Props = {
    onAccept: () => void;
};

const AcceptRejectButtons: React.FC<Props> = ({ onAccept }) => {
    const router = useRouter();

    return (
        <div className="flex justify-center space-x-4">
            <button
                onClick={onAccept}
                className="px-4 py-2 bg-green-500 text-xs text-gray-800 font-bold rounded-full hover:bg-green-600 focus:outline-none"
            >
                ยอมรับ
            </button>
            <button
                onClick={() => router.push("/")}
                className="px-4 py-2 bg-red-500 text-xs text-white font-bold rounded-full hover:bg-red-600 focus:outline-none"
            >
                ไม่ยอมรับ
            </button>
        </div>
    );
};

export default AcceptRejectButtons;
