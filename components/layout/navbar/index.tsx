'use client';

import CartModal from 'components/cart/modal'; // Adjust this path if needed
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

/** Example static menu items. Replace with your real data if you wish. */
const menu = [
  { title: 'Shop', path: '/shop' },
  { title: 'Healthcare Insurance Data', path: '/Study-1' },
  { title: 'Donate', path: '/Donate' },
  { title: 'About', path: '/About' }
];

export function Navbar() {
  // Local state to open/close the cart modal
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <>
      <nav className="relative flex items-center justify-between p-4 shadow">
        {/* LEFT: Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/weegi_full_logo.png" // Ensure this file is in /public
            alt="My Brand Logo"
            width={120}
            height={40}
            priority
          />
        </Link>

        {/* CENTER: Positioned text in red */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <p className="text-sm font-bold text-red-600">
            100% Of Profits Going To HCFA, Families USA, And Others.
          </p>
        </div>


        {/* RIGHT: Menu Items + Cart Icon Button */}
        <div className="flex items-center gap-6">
          {/* Menu Items */}
          <ul className="hidden items-center gap-6 md:flex">
            {menu.map((item) => (
              <li key={item.title}>
                <Link href={item.path} className="text-sm text-neutral-600 hover:text-black">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>

          {/* Cart Button */}
          <button onClick={openCart} aria-label="Open cart" className="relative">
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

      {/* Conditionally render the CartModal when isCartOpen is true */}
      {isCartOpen && <CartModal onClose={closeCart} />}
    </>
  );
}
