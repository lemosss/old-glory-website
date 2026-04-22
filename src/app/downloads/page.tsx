import { Card, CardBody, CardHeader } from "@/components/ui/card";

export const metadata = { title: "Downloads" };

const DOWNLOADS = [
  {
    title: "OldGlory Client 7.4",
    description:
      "Custom client with the server IP pre-configured. Windows x64 build.",
    file: "#",
    size: "~45 MB",
    disabled: true,
  },
  {
    title: "Pre-explored minimap",
    description:
      "All map areas already discovered. Drop it into your client's minimap/ folder.",
    file: "/assets/minimap.otmm",
    size: "1.4 MB",
  },
];

export default function DownloadsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Downloads" />
        <CardBody>
          <p className="text-sm text-stone-300">
            Everything you need to play. The client comes with the IP already
            configured — extract and run.
          </p>
        </CardBody>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {DOWNLOADS.map((d) => (
          <Card key={d.title}>
            <CardBody className="space-y-2">
              <h3 className="text-base font-semibold text-amber-300">{d.title}</h3>
              <p className="text-sm text-stone-400">{d.description}</p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-stone-500">{d.size}</span>
                {d.disabled ? (
                  <span className="rounded bg-stone-800 px-3 py-1 text-xs font-semibold text-stone-500">
                    Soon
                  </span>
                ) : (
                  <a
                    href={d.file}
                    download
                    className="rounded bg-amber-600 px-3 py-1 text-xs font-semibold text-stone-950 transition hover:bg-amber-500"
                  >
                    Download
                  </a>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
