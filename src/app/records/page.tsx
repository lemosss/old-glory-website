import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getOnlineRecord } from "@/lib/services/server-info";
import { formatUnixDate } from "@/lib/utils";

export const metadata = { title: "Records" };
export const dynamic = "force-dynamic";

export default async function RecordsPage() {
  const record = await getOnlineRecord();

  return (
    <Card>
      <CardHeader title="Online Player Record" />
      <CardBody className="space-y-4">
        {record ? (
          <div className="text-center">
            <p className="text-6xl font-bold text-amber-400">{record.record}</p>
            <p className="mt-2 text-sm text-stone-400">
              players online on {formatUnixDate(record.timestamp)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-stone-400">No record registered yet.</p>
        )}
      </CardBody>
    </Card>
  );
}
