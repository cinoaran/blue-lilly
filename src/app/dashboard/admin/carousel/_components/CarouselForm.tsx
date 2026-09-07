"use client";

import React, {useState, startTransition, useRef, ChangeEvent} from "react";
import {useRouter} from "next/navigation";
import createCarousel from "../actions/createCarousel";
import updateCarousel from "../actions/updateCarousel";
import deleteCarousel from "../actions/deleteCarousel";
import {useUploadThing} from "@/uploadthing/uploadthing";
import Image from "next/image";

export type CarouselInitial = {
  id?: string;
  title?: string;
  // Expect normalized values (nulls converted to undefined at page boundaries)
  teaser?: string;
  href?: string;
  image?: string;
  kicker?: string;
  cta?: string;
  alt?: string;
  theme?: string;
  goal?: string;
  audience?: string;
  angle?: string;
  trackEvent?: string;
  position?: number;
  isActive?: boolean;
};

type Props = {
  mode: "add" | "edit";
  initial?: CarouselInitial;
};

export default function CarouselForm({mode, initial}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [teaser, setTeaser] = useState(initial?.teaser ?? "");
  const [href, setHref] = useState(initial?.href ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [kicker, setKicker] = useState(initial?.kicker ?? "");
  const [cta, setCta] = useState(initial?.cta ?? "");
  const [alt, setAlt] = useState(initial?.alt ?? "");
  const [theme, setTheme] = useState(initial?.theme ?? "");
  const [goal, setGoal] = useState(initial?.goal ?? "");
  const [audience, setAudience] = useState(initial?.audience ?? "");
  const [angle, setAngle] = useState(initial?.angle ?? "");
  const [trackEvent, setTrackEvent] = useState(initial?.trackEvent ?? "");
  const [position, setPosition] = useState(initial?.position ?? 0);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {startUpload} = useUploadThing("carouselImage", {
    onClientUploadComplete: async (res) => {
      if (res && res.length > 0) {
        const newUrl = res[0].ufsUrl;
        setImage(newUrl);
        // If editing, immediately persist the new image to DB
        if (mode === "edit" && initial?.id) {
          try {
            setLoading(true);
            await updateCarousel(initial.id, {
              title,
              teaser,
              href,
              image: newUrl,
              kicker,
              cta,
              alt,
              theme,
              goal,
              audience,
              angle,
              trackEvent,
              position: Number(position),
              isActive,
            });
            setLoading(false);
            alert("Bild hochgeladen und gespeichert.");
            router.refresh();
          } catch (err) {
            console.error(err);
            setLoading(false);
            alert("Fehler beim Speichern des Bildes");
          }
        }
      }
    },
    onUploadError: (err) => {
      console.error("UploadThing error", err);
      alert("Upload fehlgeschlagen: " + err.message);
    },
  });

  const onFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await startUpload(Array.from(files));
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "add") {
        await createCarousel({
          title,
          teaser,
          href,
          image,
          kicker,
          cta,
          alt,
          theme,
          goal,
          audience,
          angle,
          trackEvent,
          position: Number(position),
          isActive,
        });
      } else if (mode === "edit" && initial?.id) {
        await updateCarousel(initial.id, {
          title,
          teaser,
          href,
          image,
          kicker,
          cta,
          alt,
          theme,
          goal,
          audience,
          angle,
          trackEvent,
          position: Number(position),
          isActive,
        });
      }

      startTransition(() => {
        router.push("/dashboard/admin/carousel");
      });
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Fehler beim Speichern");
    }
  }

  async function handleDelete() {
    if (!initial?.id) return;
    if (!confirm("Slide wirklich löschen?")) return;
    setLoading(true);
    try {
      await deleteCarousel(initial.id);
      startTransition(() => {
        router.push("/dashboard/admin/carousel");
      });
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Fehler beim Löschen");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-2xl mx-auto p-6 bg-secondary/50 rounded-md"
    >
      <div className="mb-4">
        <label className="block text-sm">Kicker</label>
        <input
          value={kicker}
          onChange={(e) => setKicker(e.target.value)}
          className="w-full mt-1 p-2 rounded border"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mt-1 p-2 rounded border"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm">Teaser</label>
        <textarea
          value={teaser}
          onChange={(e) => setTeaser(e.target.value)}
          className="w-full mt-1 p-2 rounded border"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm">Link (href)</label>
        <input
          value={href}
          onChange={(e) => setHref(e.target.value)}
          className="w-full mt-1 p-2 rounded border"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm">Call to action (cta)</label>
        <input
          value={cta}
          onChange={(e) => setCta(e.target.value)}
          className="w-full mt-1 p-2 rounded border"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm">Image alt text</label>
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          className="w-full mt-1 p-2 rounded border"
        />
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm">Theme</label>
          <input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full mt-1 p-2 rounded border"
          />
        </div>
        <div>
          <label className="block text-sm">Goal</label>
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full mt-1 p-2 rounded border"
          />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm">Audience</label>
          <input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full mt-1 p-2 rounded border"
          />
        </div>
        <div>
          <label className="block text-sm">Angle</label>
          <input
            value={angle}
            onChange={(e) => setAngle(e.target.value)}
            className="w-full mt-1 p-2 rounded border"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm">Tracking event</label>
        <input
          value={trackEvent}
          onChange={(e) => setTrackEvent(e.target.value)}
          className="w-full mt-1 p-2 rounded border"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm">Image</label>
        <div className="flex items-center gap-4">
          <div className="w-48 h-24 bg-muted border rounded overflow-hidden flex items-center justify-center">
            {image ? (
              <Image
                src={image}
                alt={title ?? "carousel image"}
                width={320}
                height={160}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="text-sm text-foreground/60 p-2">
                Kein Bild ausgewählt
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileSelected}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn"
            >
              Upload
            </button>
            <div className="text-xs text-foreground/60">
              UploadThing wird für Uploads verwendet.
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4 flex gap-4 items-center">
        <label className="block text-sm">Position</label>
        <input
          type="number"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          className="w-24 mt-1 p-2 rounded border"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />{" "}
          Aktiv
        </label>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {mode === "add" ? "Erstellen" : "Speichern"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="btn-ghost"
          >
            Löschen
          </button>
        )}
      </div>
    </form>
  );
}
