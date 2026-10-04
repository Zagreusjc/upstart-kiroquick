import 'leaflet/dist/leaflet.css';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { clinicContact } from '../logic/contact';
import { formatDistance, type ClinicWithDistance, type LatLng } from '../logic/geo';

/**
 * Leaflet map of the listed clinics. Loaded lazily (React.lazy) so Leaflet
 * and its CSS stay out of the main bundle. CircleMarker avoids the default
 * marker image paths that break under Vite.
 */
export default function ClinicMap({
  clinics,
  center,
}: {
  clinics: ClinicWithDistance[];
  center: LatLng;
}) {
  return (
    <div role="region" aria-label="Map of clinics. The list below has the same clinics.">
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={12}
      scrollWheelZoom={false}
      className="h-72 w-full rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker
        center={[center.lat, center.lng]}
        radius={6}
        pathOptions={{ color: '#1e293b', fillColor: '#1e293b', fillOpacity: 0.9 }}
      >
        <Popup>Sorting from here</Popup>
      </CircleMarker>
      {clinics.map((clinic) => (
        <CircleMarker
          key={clinic.id}
          center={[clinic.lat, clinic.lng]}
          radius={10}
          pathOptions={
            clinic.type === 'public'
              ? { color: '#047857', fillColor: '#10b981', fillOpacity: 0.8 }
              : { color: '#be123c', fillColor: '#fb7185', fillOpacity: 0.8 }
          }
        >
          <Popup>
            <strong>{clinic.name}</strong>
            <br />
            {clinic.type === 'public' ? 'Public' : 'Private'} · {clinic.area}, {clinic.city}
            <br />
            {formatDistance(clinic.distanceKm)} away · {clinic.hours}
            <br />
            {clinic.services.join(', ')}
            {clinic.partner && (
              <>
                <br />
                Accepts INLABABOO vouchers (illustrative)
              </>
            )}
            <MapContact clinic={clinic} />
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
    </div>
  );
}

function MapContact({ clinic }: { clinic: ClinicWithDistance }) {
  const contact = clinicContact(clinic);
  return (
    <>
      {contact.bookingHref && (
        <>
          <br />
          <a href={contact.bookingHref} target="_blank" rel="noopener noreferrer">
            Book an appointment online
          </a>
        </>
      )}
      {contact.telHref ? (
        <>
          <br />
          <a href={contact.telHref}>Call {contact.phoneDisplay}</a>
        </>
      ) : (
        contact.phoneDisplay && (
          <>
            <br />
            Appointments: {contact.phoneDisplay} (sample number)
          </>
        )
      )}
    </>
  );
}
