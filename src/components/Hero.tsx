import type { ReactNode } from 'react';
import logoAcm from '../assets/logos/logo-ieee-style.png';

/* Accent colors are taken from the three tiles of the ACM logo (lightened for contrast on black). */
const BLUE = 'text-[#7ba7ea]';
const AMBER = 'text-[#ffc233]';
const RED = 'text-[#ff7a62]';

const Em = ({ color, children }: { color: string; children: ReactNode }) => (
  <bdi className={`font-bold ${color}`}>{children}</bdi>
);

const Hero = () => {
  return (
    <section id="Home" className="lab-container flex min-h-screen items-center pb-16 pt-28 lg:pt-32">
      <div className="grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-16 animate-[heroSlideUp_0.8s_ease-out_both]">
        {/* Text: first in DOM => right side in RTL */}
        <div className="relative ps-6 sm:ps-8">
          {/* three-tone bar echoing the logo's blue / yellow / red tiles */}
          <span aria-hidden="true" className="absolute inset-y-0 start-0 flex w-1 flex-col overflow-hidden rounded-full">
            <span className="flex-1 bg-[#4a7fc9]" />
            <span className="flex-1 bg-[#ffb81c]" />
            <span className="flex-1 bg-[#c0392b]" />
          </span>

          <p className="text-xl font-extrabold leading-[2] text-white sm:text-2xl lg:text-[1.65rem]">
            شاخه دانشجویی دانشگاه صنعتی اصفهان بخشی از شبکه جهانی{' '}
            <Em color={BLUE}>Association for Computing Machinery</Em> است؛ بزرگترین و معتبرترین انجمن علمی
            بین‌المللی در حوزه علوم رایانه و فناوری اطلاعات.
          </p>

          <div className="mt-6 space-y-5 text-[0.95rem] leading-8 text-slate-300 sm:text-base sm:leading-9">
            <p>
              آغاز از فعالیت جهانی ACM از سال <Em color={AMBER}>۱۹۴۷</Em> میلادی بوده و ماموریت آن توسعه دانش،
              پژوهش، فرهنگ همکاری میان دانشجویان، پژوهشگران و متخصصان حوزه کامپیوتر است.
            </p>
            <p>
              این نهاد با انتشار معتبرترین مجلات و نشریات علمی در حوزه کامپیوتر و برگزاری کنفرانس‌های بین‌المللی
              معتبر، نقش کلیدی در توسعه و جهت‌دهی به تحقیقات جهانی در علوم کامپیوتر ایفا می‌کند.
            </p>
            <p>
              همچنین ACM برگزار کننده بزرگترین و معتبرترین مسابقه جهانی برنامه‌نویسی دانشجویی جهان یعنی{' '}
              <Em color={RED}>ICPC</Em> <bdi>(International Collegiate Programming Contest)</bdi> می‌باشد.
            </p>
            <p>
              در کنار فعالیت‌های بین‌المللی، ACM برای گسترش دانش و پرورش استعداد‌های جوان، شاخه‌های دانشجویی را در
              سراسر دانشگاه‌های جهان ایجاد کرده‌است. این شاخه‌ها با حمایت و تحت نظر مستقیم ACM فعالیت می‌کنند و
              هدفشان فراهم کردن بستری برای آموزش، همکاری، تجربه علمی و عملی در محیط دانشگاهی است.
            </p>
          </div>
        </div>

        {/* Logo: left side in RTL; on mobile it goes above the text */}
        <div className="order-first flex justify-center lg:order-none">
          <img
            src={logoAcm}
            alt="لوگوی ACM"
            className="h-auto w-full max-w-[22rem] select-none object-contain sm:max-w-md lg:max-w-full"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
