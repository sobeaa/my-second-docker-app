import {Job, Worker} from 'bullmq';
import {Queue} from 'bullmq';

type Repairable = { damage: number };
type Paintable = { color: string };
type Car = { model: string; } & Paintable & Repairable;
type Wall = { room: string; } & Paintable;
type Scooter = { model: string; } & Paintable;

type PaintedStatus = { success: boolean };

const paintQueue = new Queue('Paint');
const repairQueue = new Queue('Repair');

const car = {
  model: "tesla",
  color: "red",
  damage: 10,
} as Car;

paintQueue.add('cars', car);
paintQueue.add('walls', {color: 'blue', room: "kitchen"} as Wall);
paintQueue.add('scooters', {color: 'blue', model: "ryde"} as Scooter);

repairQueue.add('cars', car);

async function paint(item: Paintable): Promise<PaintedStatus> {
  console.log("Paint the item with color:", item.color);

  return {
    success: true,
  } as PaintedStatus;
}

void paint(wall);
const promise = paint(scooter);
const status = await paint(car);

paint(scooter).then((status: PaintedStatus) => {
  if (status.success) {
    console.log("Scooter painted successfully");
  } else {
    console.log("Failed to paint scooter");
  }
}).catch((err => (
  console.error("Error painting scooter:", err)
))).finally(() => (
  console.log("Done with painting scooter")
));

console.log("Painting promise:", promise);

const paintWorker1 = new Worker('Paint', async (job: Job<Paintable>) => {
  switch (job.name) {
    case 'walls':
      const wall = job.data as Wall;
      await preparePaintWall(wall);
      break;

    case 'scooters':
      const scooter = job.data as Scooter;
      break;

    case 'cars':
      const car = job.data as Car;
      break;

    default:
      throw new Error(`Unknown job name: ${job.name}`);
  }
});

const repairWorker1 = new Worker('Repair', async (job: Job<Repairable>) => {
  switch (job.name) {
    case 'cars':
      const car = job.data as Car;
      await repairCar(car);
      break;

    default:
      throw new Error(`Unknown job name: ${job.name}`);
  }
});
