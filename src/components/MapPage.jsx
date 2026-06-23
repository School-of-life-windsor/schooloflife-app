import React from 'react';
import { MapPin, QrCode, Car, Calendar, Info } from 'lucide-react';

export default function MapPage({ role, currentUser }) {
  return (
    <section className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-16 animate-fade-in">
      {/* Page Title */}
      <div className="flex items-center gap-3 border-b-4 border-stone-900 pb-3">
        <MapPin className="w-8 h-8 text-forest shrink-0" />
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight text-forest m-0 uppercase">
            Camp Location & Map
          </h1>
          <p className="text-stone-600 text-sm">
            Headquarters coordinates, logistics access, parking regulations, and check-in scanner.
          </p>
        </div>
      </div>

      {/* Main Grid: Location Card + Google Maps Embed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* HQ Details Card */}
        <div className="flex flex-col justify-between bg-stone-800 text-canvas p-6 trail-border trail-shadow rounded-sm relative overflow-hidden">
          {/* Subtle Accent Background Gradient */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-campfire/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-forest/20 rounded-full blur-xl pointer-events-none"></div>

          <div>
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold block mb-1">
              Windsor Area Headquarters
            </span>
            <h3 className="text-xl font-display font-black text-campfire uppercase tracking-wide mb-3">
              School of Life Camp
            </h3>
            <p className="text-sm text-stone-300 leading-relaxed font-semibold">
              3940 ON-3, Oldcastle, ON N0R 1L0 <br />
              Essex County, Ontario, Canada
            </p>
          </div>

          <div className="mt-8 border-t border-stone-700 pt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-300">
              <Calendar className="w-4 h-4 text-campfire shrink-0" />
              <span>Session: July 10 - August 22</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-campfire">
              <Info className="w-4 h-4 shrink-0" />
              <span>18+ Brothers Only • Limited Seats Registration</span>
            </div>
          </div>
        </div>

        {/* Google Maps Interactive Frame */}
        <div className="trail-border rounded-sm overflow-hidden h-[240px] md:h-auto relative trail-shadow">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3443.1046579966205!2d-82.95237762357789!3d42.22448634365562!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x883b29a82ed3ebc5%3A0x19fcc9bdfa98015b!2s3940%20ON-3%2C%20Oldcastle%2C%20ON%20N0R%201L0!5e1!3m2!1sen!2sca!4v1780976123207!5m2!1sen!2sca"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="School of Life Camp Location Map"
          ></iframe>
        </div>
      </div>

      {/* Downstream Integration Grid: QR Check-In & Parking Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* QR Code Check-in card */}
        <div className="bg-[#EAE6DF] p-6 trail-border trail-shadow rounded-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <QrCode className="w-6 h-6 text-forest shrink-0" />
              <h3 className="text-lg font-display font-extrabold uppercase text-stone-900 m-0">
                Brother Check-In QR
              </h3>
            </div>
            <p className="text-xs text-stone-700 font-semibold leading-relaxed mb-4">
              Upon arriving at the camp entrance, present this screen to the gate volunteer. A personalized QR code identifier will render here downstream to track attendance and log merit points.
            </p>
          </div>

          {/* QR Scanner Placeholder Graphics */}
          <div className="h-32 border-2 border-dashed border-stone-400 bg-canvas/40 flex items-center justify-center rounded-sm relative">
            <div className="absolute inset-0 bg-stone-900/5 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 text-center">
              <QrCode className="w-10 h-10 text-stone-400 animate-pulse mb-1" />
              <span className="text-[9px] uppercase font-black text-stone-500 tracking-wider">
                Digital Attendance Scanner (Developing)
              </span>
            </div>
          </div>
        </div>

        {/* Parking and Site Rules Card */}
        <div className="bg-[#EAE6DF] p-6 trail-border trail-shadow rounded-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Car className="w-6 h-6 text-campfire shrink-0" />
              <h3 className="text-lg font-display font-extrabold uppercase text-stone-900 m-0">
                Parking & Gate Access
              </h3>
            </div>
            <p className="text-xs text-stone-700 font-semibold leading-relaxed mb-4">
              Safety is paramount for all participants. Camp traffic and vehicle guidelines will render here to coordinate carpools and maintain access routes clear.
            </p>
          </div>

          {/* Directions / Instructions list */}
          <div className="border border-stone-300 p-3 bg-canvas/30 rounded-sm">
            <div className="flex gap-2 items-start text-[11px] font-bold text-stone-700 mb-2">
              <span className="bg-forest text-canvas w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0">1</span>
              <span>Enter via the primary driveway on ON-3. Drive under 15 km/h.</span>
            </div>
            <div className="flex gap-2 items-start text-[11px] font-bold text-stone-700 mb-2">
              <span className="bg-forest text-canvas w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0">2</span>
              <span>Park only in designated grass lots; do not obstruct access roads.</span>
            </div>
            <div className="flex gap-2 items-start text-[11px] font-bold text-stone-750">
              <span className="bg-campfire text-canvas w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0">!</span>
              <span className="text-campfire">Emergency vehicles must have unobstructed access to all tents.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
