import 'server-only'

import { getRedis } from '@/lib/storage/redis'
import type { OperationalScriptExecutionRecorder } from './script-execution-recorder'
import type { OperationalScriptExecution } from './types'

const EXECUTION_KEY='george:operational-memory:execution:v1:'
const CONVERSATION_INDEX='george:operational-memory:conversation-executions:v1:'

const executionKey=(id:string)=>EXECUTION_KEY+encodeURIComponent(id)
const conversationKey=(id:string)=>CONVERSATION_INDEX+encodeURIComponent(id)

function parse(raw:string|null):OperationalScriptExecution|null{
 if(!raw)return null
 try{
  const x=JSON.parse(raw) as OperationalScriptExecution
  if(!x?.id)return null
  return x
 }catch{
  return null
 }
}

export function createRedisOperationalScriptExecutionRecorder():
OperationalScriptExecutionRecorder{

 return{

  async getById(id){
   return parse(await getRedis().get(executionKey(id)))
  },

  async save(execution){

   const redis=getRedis()

   await redis
    .multi()
    .set(
      executionKey(execution.id),
      JSON.stringify(execution)
    )
    .sAdd(
      conversationKey(execution.conversationId),
      execution.id
    )
    .exec()

  },

  async listByConversation(conversationId){

   const redis=getRedis()

   const ids=await redis.sMembers(
     conversationKey(conversationId)
   )

   const values=await Promise.all(
      ids.map(id=>redis.get(executionKey(id)))
   )

   return values
      .map(parse)
      .filter(
        (x):x is OperationalScriptExecution=>x!==null
      )
      .sort(
        (a,b)=>b.createdAt-a.createdAt
      )
  }

 }

}
