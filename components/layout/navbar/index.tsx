'use client';

import Image from 'next/image';
import Link from 'next/link';
// Remove or comment out the custom CartModal import if not needed
// import CartModal from 'components/cart/modal';

/** Example static menu items. Replace with your real data if you wish. */
const menu = [
  { title: 'Shop', path: '/shop' },
  { title: 'Healthcare Insurance Data', path: '/Study-1' },
  { title: 'Donate', path: '/Donate' },
  { title: 'About', path: '/About' }
];

export function Navbar() {
  // If you’re not using your custom cart modal, you can remove these lines:
  // const [isCartOpen, setIsCartOpen] = useState(false);
  // const openCart = () => setIsCartOpen(true);
  // const closeCart = () => setIsCartOpen(false);

  return (
    <>
      <nav className="flex items-center justify-between p-4 shadow">
        {/* LEFT: Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/weegi_full_logo.png"
            alt="My Brand Logo"
            width={120}
            height={40}
            priority
          />
        </Link>

        {/* RIGHT: Menu Items */}
        <div className="flex items-center gap-6">
          <ul className="hidden items-center gap-6 md:flex">
            {menu.map((item) => (
              <li key={item.title}>
                <Link href={item.path} className="text-sm text-neutral-600 hover:text-black">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>

          {/* If you no longer need a custom cart modal button, you can remove or repurpose this button */}
          <button aria-label="Open cart" className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6 text-neutral-600 hover:text-black"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 2.25l1.5 3.75m1.5 3.75h13.5l1.5-3.75H5.25M8.25 13.5V9.75h7.5V13.5M8.25 13.5h7.5l3 7.5H5.25l3-7.5z"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Remove the custom CartModal if you are not using it */}
      {/* {isCartOpen && <CartModal onClose={closeCart} />} */}
    </>
  );
}
