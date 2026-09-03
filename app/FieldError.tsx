export function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p className="mt-2 bg-[#FF6B6B] border-2 border-black px-3 py-2 font-mono text-xs text-black font-bold dark:border-gray-600">
      {message}
    </p>
  );
}
