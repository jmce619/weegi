'use client';

import CartModal from 'components/cart/modal'; // Adjust this path if needed
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const menu = [
  { title: 'Shop', path: '/shop' },
  { title: 'Healthcare Insurance Data', path: '/Study-1' },
  { title: 'Donate', path: '/Donate' },
  { title: 'About', path: '/About' }
];

export function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  return (
    <>
      <nav className="relative flex items-center justify-between p-4 shadow">
        {/* LEFT: Logo */}
        <Link href="/" className="shrink-0">
          <div className="relative w-40 h-12">
            <Image
              src="/weegi_full_logo.png"
              alt="My Brand Logo"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
        </Link>

        {/* CENTER: Always centered red text */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <p className="text-xs md:text-sm font-bold text-red-600">
          100% of Profits to Healthcare Charities.
        </p>
      </div>


        {/* RIGHT: Desktop Menu, Mobile Hamburger, and Cart Button */}
        <div className="flex items-center gap-4">
          {/* Desktop Menu Items */}
          <ul className="hidden items-center gap-6 md:flex">
            {menu.map((item) => (
              <li key={item.title}>
                <Link href={item.path} className="text-sm text-neutral-600 hover:text-black">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Hamburger Menu Button */}
          <button onClick={toggleMobileMenu} className="md:hidden" aria-label="Toggle Menu">
            <svg className="h-6 w-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-0 left-0 right-0 bg-white shadow-md z-50 md:hidden">
          <ul className="flex flex-col gap-4 p-4">
            {menu.map((item) => (
              <li key={item.title}>
                <Link
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm text-neutral-600 hover:text-black"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Conditionally render the CartModal when isCartOpen is true */}
      {isCartOpen && <CartModal onClose={closeCart} />}
    </>
  );
}
