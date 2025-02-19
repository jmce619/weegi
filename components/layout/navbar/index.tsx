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
          <Image
            src="/weegi_full_logo.png" // Ensure this file is in /public
            alt="My Brand Logo"
            width={120}
            height={40}
            priority
          />
        </Link>

        {/* CENTER: Positioned text in red (visible only on medium and larger screens) */}
        <div className="hidden md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
          <p className="text-sm font-bold text-red-600">
            100% Of Profits Going To HCFA, Families USA, And Others.
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
          <button
            onClick={toggleMobileMenu}
            className="md:hidden"
            aria-label="Toggle Menu"
          >
            <svg
              className="h-6 w-6 text-neutral-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
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
