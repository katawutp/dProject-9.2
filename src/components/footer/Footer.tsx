import Link from "next/link";

export function Footer() {
    return (
        <div className="flex flex-col items-center mt-20">
            <Link
                className="text-center text-sm text-white-400 bg-red-500 px-4 py-2 rounded-md"
                target="_blank"
                href="https://www.youtube.com/@easterncyberco.ltd.6677"
            >
                Watch tutorial on YouTube
            </Link>
            <Link
                className="text-center text-sm text-gray-400 mt-2"
                target="_blank"
                href="https://github.com/katawutp/dProject-9.2.git"
            >
                View code on GitHub
            </Link>
            <Link href={"/"} className="text-sm text-gray-400 mt-8">
                Back to menu
            </Link>
            <Link
                className="text-gray-100 mt-8"
                target="_blank"
                href="https://eastern-cyber.com/"
            ><b>Eastern Cyber</b><sup>TM</sup></Link>
             All right reserved &#169; 2024 - 2025
        </div>
    )
}
