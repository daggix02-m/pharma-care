export function AuthSeparator() {
  return (
    <div className='flex w-full items-center justify-center my-6'>
      <div className='bg-slate-200 h-[1px] w-full' />
      <span className='text-slate-500 font-body px-3 text-xs uppercase font-semibold tracking-wider'>
        OR
      </span>
      <div className='bg-slate-200 h-[1px] w-full' />
    </div>
  );
}
