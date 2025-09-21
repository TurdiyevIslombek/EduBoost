// import {Webhook} from 'svix'
// import { headers } from 'next/headers'
// import { WebhookEvent } from '@clerk/nextjs/server'
// import { db } from '@/db'
// import { users } from '@/db/schema'
// import { eq } from 'drizzle-orm'

// export async function POST(req:Request) {
//     const SIGNING_SECRET = process.env.CLERK_SIGNING_SECRET
//     if (!SIGNING_SECRET) {
//         throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to •env or • env, local')
//     }

//     const wh = new Webhook(SIGNING_SECRET)

//     const headerPayload = await headers()
//     const svix_id = headerPayload.get('svix-id')
//     const svix_timestamp = headerPayload.get('svix-timestamp')
//     const svix_signature = headerPayload.get('svix-signature')

//     if (!svix_id || !svix_timestamp || !svix_signature) {
//         return new Response('Error: Missing Svix headers', { status: 400 })
//     }

//     const payload = await req.json()
//     const body = JSON.stringify(payload)

//     let evt: WebhookEvent

//     try {

//         evt = wh.verify(body,{
//             'svix_id': svix_id,
//             'svix_timestamp': svix_timestamp,
//             'svix_signature': svix_signature,
//         }) as WebhookEvent
//     } catch (err) {
//         console.error('Error: Could not verify webhook:', err)
//         return new Response('Error: Verification error', { status: 400 })
//     }


//     const eventType = evt.type

    
    
//     if (eventType === 'user.created') {
//         const {data} = evt
//         await db.insert(users).values({
//             clerkId: data.id,
//             name : `${data.first_name} ${data.last_name}`,
//             imageUrl : data.image_url,
//         })
//     }

//     if (eventType === 'user.deleted') {
//         const {data} = evt

//         if (!data.id){
//             return new Response('Error: Missing user ID', { status: 400 })
//         }


//         await db.delete(users).where(eq(users.clerkId, data.id))
//     }

//     if (eventType === 'user.updated') {
//         const {data} = evt
//         await db.update(users).set({
//             name : `${data.first_name} ${data.last_name}`,
//             imageUrl : data.image_url,
//         })
//         .where(eq(users.clerkId, data.id))

//     return new Response('Webhook received', { status: 200 })
// }
// }
// ================================

import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
    // 1. Ensure signing secret is available
    const SIGNING_SECRET = process.env.CLERK_SIGNING_SECRET
    if (!SIGNING_SECRET) {
        throw new Error('Error: Missing CLERK_SIGNING_SECRET in .env')
    }

    // 2. Initialize webhook verifier
    const wh = new Webhook(SIGNING_SECRET)

    // 3. Extract headers (no await here)
    const headerPayload = await headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error: Missing Svix headers', { status: 400 })
    }

    // 4. Read raw body (must use text() for verification)
    const body = await req.text()

    let evt: WebhookEvent
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error('Error: Could not verify webhook:', err)
        return new Response('Error: Verification failed', { status: 400 })
    }

    // 5. Handle events
    const eventType = evt.type

    if (eventType === 'user.created') {
        const { data } = evt
        await db.insert(users).values({
            clerkId: data.id,
            name: `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim(),
            imageUrl: data.image_url,
        })
    }

    if (eventType === 'user.deleted') {
        const { data } = evt
        if (!data.id) {
            return new Response('Error: Missing user ID', { status: 400 })
        }
        await db.delete(users).where(eq(users.clerkId, data.id))
    }

    if (eventType === 'user.updated') {
        const { data } = evt
        await db.update(users).set({
            name: `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim(),
            imageUrl: data.image_url,
        }).where(eq(users.clerkId, data.id))
    }

    return new Response('Webhook received', { status: 200 })
}
