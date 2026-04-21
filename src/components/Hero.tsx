import heroAerial from "@/assets/hero/hero-aerial.jpg";
import heroRock from "@/assets/hero/hero-rock.jpg";
import heroGroup from "@/assets/hero/hero-group.jpg";
import heroSunset from "@/assets/hero/hero-sunset.jpg";

const PHOTOS: { src: string; alt: string }[] = [
  { src: heroAerial, alt: "豆腐岬海岸空拍" },
  { src: heroRock, alt: "秘境岩岸裝備" },
  { src: heroGroup, alt: "團體立槳合影" },
  { src: heroSunset, alt: "日出獨木舟" },
];

export function Hero() {
  return (
    <div className="space-y-5">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-ocean-700 sm:text-4xl">
          水行者海洋運動中心
        </h1>
        <p className="text-base font-semibold text-slate-700 sm:text-lg">
          2026 海上秘境體驗活動：立槳 / 獨木舟
        </p>
        <p className="text-sm font-medium text-ocean-600">
          官網預約表單
        </p>
        <dl className="mx-auto max-w-md space-y-1 text-sm leading-relaxed text-slate-600">
          <div className="flex flex-wrap justify-center gap-x-1">
            <dt className="text-slate-500">活動地點：</dt>
            <dd>宜蘭縣豆腐岬海水浴場</dd>
          </div>
          <div className="flex flex-wrap justify-center gap-x-1">
            <dt className="text-slate-500">活動水域：</dt>
            <dd>豆腐岬 / 猴猴鼻 / 賊仔澳玻璃沙灘</dd>
          </div>
          <div className="flex flex-wrap justify-center gap-x-1">
            <dt className="text-slate-500">集合地點：</dt>
            <dd>宜蘭縣蘇澳鎮跨港路 6 號（討海文化館旁）</dd>
          </div>
        </dl>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {PHOTOS.map((p) => (
          <img
            key={p.src}
            src={p.src}
            alt={p.alt}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-xl object-cover shadow-sm"
          />
        ))}
      </div>
    </div>
  );
}
