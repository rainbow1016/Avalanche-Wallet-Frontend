import { RiHome2Line } from "react-icons/ri";
import { IoWallet } from "react-icons/io5";
import { MdPeopleAlt } from "react-icons/md";
import { FiMessageCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";

export const Footer = () => {
  const router = useRouter();
  return (
    <div className="bg-gradient-button-bg w-full h-11 fixed bottom-0 flex justify-center">
      <div className="flex text-white text-xl justify-between items-center w-90 sm:w-353px">
        <RiHome2Line onClick={() => router.push("/")} />
        <IoWallet onClick={() => router.push("/wallet")} />
        <MdPeopleAlt onClick={() => router.push("/")} />
        <FiMessageCircle onClick={() => router.push("/message")} />
      </div>
    </div>
  );
};
