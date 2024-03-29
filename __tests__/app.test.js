const request = require("supertest")
const app = require("../app.js");
const db = require("../db/connection")
const seed = require("../db/seed.js")
const data = require("../db/test-data")

beforeEach(() => { 
   return seed(data)
})

afterAll(() => { 
    return db.end()
})

describe("GET /api/snacks", () => { 
    it('responds with status 200 and an array containing data for all snacks',() => { 
        return request(app)
        .get('/api/snacks')
        .expect(200)
            .then(({ body }) => { 
            expect(body.snacks).toHaveLength(6)
            body.snacks.forEach((snack) => {
                 expect(typeof snack.snack_id).toBe("number") 
                 expect(typeof snack.snack_name).toBe("string") 
                 expect(typeof snack.snack_description).toBe("string") 
                 expect(typeof snack['price_in_pence']).toBe("number") 
                 expect(typeof snack.category_id).toBe("number") 
            })
        })
    })
    it('snacks are ordered by snack_name by default', () => { 
        return request(app)
            .get('/api/snacks')
            .expect(200)
            .then(({ body }) => { 
                expect(body.snacks).toBeSortedBy('snack_name')
            })
    })
    it('takes a sort_by query and responds with snacks sorted by the given column name', () => { 
        return request(app)
            .get('/api/snacks?sort_by=price_in_pence')
            .expect(200)
            .then(({ body }) => { 
                expect(body.snacks).toBeSortedBy('price_in_pence')
            })
    })
    it('returns an error when given a non-valid sort_by', () => { 
        return request(app)
            .get('/api/snacks?sort_by=somethingbad')
            .expect(400)
            .then(({ body }) => { 
                expect(body.message).toBe("bad request")
            })
    })
    it('takes a category_id query and responds with only snacks from the given category', () => { 
        return request(app)
            .get('/api/snacks?category_id=2')
            .expect(200)
            .then(({ body: { snacks } }) => { 
                expect(snacks.length).toBe(3)
                snacks.forEach((snack) => { 
                    expect(snack.category_id).toBe(2)
                })

            })
    })
    it('responds with a 400 error when passed a category_id of the wrong data type', () => { 
        return request(app)
            .get('/api/snacks?category_id=nonsense')
            .expect(400)
            .then(({ body }) => { 
                expect(body.message).toBe("Invalid id type")
            })
    })
    it('responds with a 404 error when passed a catagor_id that is valid but not present in our database', () => {
        return request(app)
            .get('/api/snacks?category_id=1000')
            .expect(404)
            .then(({ body }) => { 
                expect(body.message).toBe('not found')
            })
    })
})

describe("GET /api/snacks/:snack_id", () => { 
    it('responds with status 200 and an object containing the correct snack data', () => {
        return request(app)
            .get('/api/snacks/5')
            .expect(200)
            .then(({ body: { snack } }) => { 
                expect(snack.snack_id).toBe(5)
                expect(snack.snack_name).toBe('Snack C')
                expect(snack.snack_description).toBe('Snack description C')
                expect(snack.price_in_pence).toBe(150)
                expect(snack.category_id).toBe(1)
        })
    })
    it('responds with status 400 and an error message if passed an invalid snack id', () => { 
        return request(app)
            .get('/api/snacks/not-an-id')
            .expect(400)
            .then(({ body: { message } }) => { 
                expect(message).toBe("Invalid id type")
            })
    })
    it('responds with status 404 and an error message if passed a valid snack_id that does not exist in the database', () => { 
        return request(app)
            .get('/api/snacks/1000')
            .expect(404)
            .then(({ body: { message } }) => { 
                expect(message).toBe("Id not found")
            })
    })
})

describe("POST /api/snacks", () => { 
    it("responds with status 201 and the created snack", () => { 
        const testSnack = {
            snack_name: ""
        }
        return request(app)
            .post('/api/snacks')
            .send({
                snack_name: 'DairyLea Dunkers',
                snack_description: "Finally a savoury alternative to yoghurt",
                price_in_pence: 122,
                category_id: 4,
            })
            .expect(201)
            .then(({ body: { newSnack} }) => { 
                expect(newSnack.snack_name).toBe('DairyLea Dunkers')
                expect(newSnack.snack_description).toBe("Finally a savoury alternative to yoghurt")
                expect(newSnack.price_in_pence).toBe(122)
                expect(newSnack.category_id).toBe(4)
            })
    })
})

describe("GET /api/venders", () => { 
    it("responds with status 200 and an array containing data for all vending machines", () => { 
        return request(app)
        .get('/api/venders')
        .expect(200)
            .then(({ body }) => {
                expect(body.vendingMachines.length).toBe(4)
                body.vendingMachines.forEach((vendingMachine) => { 
                    expect(typeof vendingMachine.id).toBe("number") 
                    expect(typeof vendingMachine.location).toBe("string") 
                    expect(typeof vendingMachine.rating).toBe("number")  
                })
         })
    })
});

describe("GET /api/venders/:venderId", () => { 
    it("responds with status 200 and an object containing the correct vending machine data", () => {
        return request(app)
        .get('/api/venders/3')
        .expect(200)
        .then(({ body }) => {
            expect(body.vendingMachine.id).toBe(3)
            expect(body.vendingMachine.location).toBe('Location C')
            expect(body.vendingMachine.rating).toBe(4)
        })
    })
})