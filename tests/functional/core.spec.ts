import { test } from '@japa/runner'

test.group('Core', () => {
  test('GET / renders home component for guests', async ({ client }) => {
    const response = await client.get('/').withInertia()
    response.assertStatus(200)
    response.assertInertiaComponent('core/home')
  })

  // test('GET /health returns a health report (JSON)', async ({ client }) => {
  //   const response = await client.get('/health')
  //   response.assertStatus(200)
  //   // optional: cannot assert exact shape without running real checks
  // })
})
