import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { randomUUID } from "crypto";
const amounts={postal:{6:9900,12:16800},legal:{6:19900,12:34800}} as const;
const schema=z.object({email:z.string().email(),phone:z.string().max(40).optional(),service:z.enum(["postal","legal"]),duration:z.union([z.literal(6),z.literal(12)])});
export async function POST(req:Request){try{const b=schema.parse(await req.json());const publicId=randomUUID();const amountCents=Math.round(amounts[b.service][b.duration]*1.22);await db.insert(orders).values({publicId,email:b.email,phone:b.phone,service:b.service,durationMonths:b.duration,amountCents});return NextResponse.json({orderId:publicId,status:"pending"},{status:201});}catch(e){console.error(e);return NextResponse.json({error:"Invalid order"},{status:400})}}
