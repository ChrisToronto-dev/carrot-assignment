import Link from "next/link";

interface ListTweetProps {
  tweet: string;
  created_at: Date;
  id: number;
}

export default function ListProduct({ tweet, created_at, id }: ListTweetProps) {
  const formattedDate = created_at.toLocaleDateString();
  return (
    <Link
      href={`/tweets/${id}`}
      className="flex gap-5 rounded-2xl border-2 border-gray-500 p-4 mb-4 last:mb-0"
    >
      <div className="flex flex-col gap-1 *:text-black">
        <span className="text-lg font-semibold">{tweet}</span>
        <span className="text-sm text-neutral-500">{formattedDate}</span>
      </div>
    </Link>
  );
}
