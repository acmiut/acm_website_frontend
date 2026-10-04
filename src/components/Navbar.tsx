import React, { useState } from 'react';
import { LogIn, Menu, UserRoundPlus, X } from 'lucide-react';
import logoIcon from '../assets/react.svg';
import { Link, useNavigate, useLocation } from 'react-router';

const HEADER_OFFSET = 80;

const scrollToSection = (sectionId: string) => {
  if (sectionId === 'Home') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const element = document.getElementById(sectionId);
  if (element) {
    const y = element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
};

const useLinkClickHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (href: string, onComplete?: () => void) => {
    if (href.startsWith('/#')) {
      const sectionId = href.replace('/#', '');

      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => scrollToSection(sectionId), 150);
      } else {
        scrollToSection(sectionId);
      }
    } else {
      navigate(href);
    }

    if (onComplete) {
      onComplete();
    }
  };
};

type NavbarItemData = {
  content: string;
  href: string;
};

const NavBarItems: NavbarItemData[] = [
  { content: 'خانه', href: '/#Home' },
  { content: 'تست', href: '/#About' }
];

const NavItems = () => {
  const handleLinkClick = useLinkClickHandler();

  return (
    <div className="hidden h-full items-center gap-1 lg:flex">
      {NavBarItems.map(({ content, href }, index) => (
        <Link
          key={index}
          to={href}
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick(href);
          }}
          className="relative flex h-10 items-center whitespace-nowrap rounded-xl px-3 text-xs font-bold text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white xl:text-sm"
        >
          {content}
        </Link>
      ))}
    </div>
  );
};

const Logo = () => {
  return (
    <Link to="/" className="group flex items-center gap-3">
      <img
        src={logoIcon}
        alt="Karsoogh Logo"
        className="h-10 w-10 object-contain transition-transform group-hover:scale-105 md:h-12 md:w-12"
      />
      <span className="hidden text-right leading-tight sm:block">
        <span className="block text-sm font-black tracking-wide text-white">ACM</span>
      </span>
    </Link>
  );
};

const LoginButton = () => {
  return (
    <Link to="/login" className="lab-button-secondary min-h-10 px-4 py-2 text-xs md:text-sm">
      <LogIn size={16} aria-hidden="true" />
      ورود
    </Link>
  );
};

const SignUpButton = () => {
  return (
    <a
      href=""
      target="_blank"
      rel="noopener noreferrer"
      className="lab-button-primary hidden min-h-10 px-4 py-2 text-xs md:inline-flex md:text-sm"
      title="رفتن به فرم ثبت‌نام"
    >
      <UserRoundPlus size={16} aria-hidden="true" />
      ثبت‌نام
    </a>
  );
};

const Hamburger = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <button
      type="button"
      className="lab-button-ghost min-h-10 px-3 py-2 lg:hidden"
      onClick={() => setIsOpen(!isOpen)}
      aria-label={isOpen ? 'بستن منو' : 'باز کردن منو'}
      aria-expanded={isOpen}
    >
      {isOpen ? <X size={28} /> : <Menu size={28} />}
    </button>
  );
};

const MobileMenu = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const handleLinkClick = useLinkClickHandler();

  if (!isOpen) return null;

  return (
    <div className="absolute left-0 top-[calc(100%+0.6rem)] w-full transition-all duration-300 ease-in-out lg:hidden">
      <div className="max-h-[calc(100vh-6.5rem)] overflow-y-auto rounded-3xl border border-white/10 bg-[#070b14] p-4 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <ul className="flex flex-col gap-2 text-base">
          {NavBarItems.map((item, index) => (
            <li key={index}>
              <Link
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item.href, () => setIsOpen(false));
                }}
                to={item.href}
                className="flex min-h-12 items-center rounded-2xl px-4 font-bold text-slate-200 transition-colors hover:bg-white/[0.07] hover:text-white"
              >
                {item.content}
              </Link>
            </li>
          ))}

          <li className="pt-2">
            <a
              href="https://form.sampad.gov.ir/sampad/formView/3097"
              target="_blank"
              rel="noopener noreferrer"
              className="lab-button-primary w-full"
              title="رفتن به فرم ثبت‌نام"
            >
              ثبت‌نام
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};
const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className="fixed inset-x-3 top-3 z-50 flex h-16 items-center rounded-3xl border border-white/10 bg-[#070b14] shadow-2xl shadow-black/35 backdrop-blur-2xl md:inset-x-4 lg:inset-x-0 lg:top-0 lg:h-20 lg:rounded-none lg:border-x-0 lg:border-t-0 lg:bg-slate-950/78"
      dir="rtl"
      aria-label="ناوبری اصلی"
    >
      <div className="lab-container flex h-full items-center justify-between">
        <div className="flex h-full items-center gap-5 md:gap-8">
          <Logo />
          <NavItems />
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <LoginButton />
          <SignUpButton />
          <Hamburger isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
      </div>

      <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} />
    </nav>
  );
};

export default Navbar;
