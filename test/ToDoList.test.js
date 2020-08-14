//note artifacts
const ToDoList = artifacts.require('./ToDoList.sol')

//accounts from ganache are injected as an array as 'accounts'
//put the tests here
//run these tests with ```truffle test``` in the console
contract('ToDoList', (accounts) => {
	//function is async to enable await
	//before
	before(async () => {
		this.tdlVar = await ToDoList.deployed()
	})

	//first test example 
	it('deployed successfully', async () => {
		const address = await this.tdlVar.address
		assert.notEqual(address, '0x0')
		assert.notEqual(address, '')
		assert.notEqual(address, 'null')
		assert.notEqual(address, undefined) 
	})

	it('lists tasks', async () => {
		//this is actually calling the getter function of the taskCount public variable, hence ().
		const taskCount = await this.tdlVar.taskCount()
		const task = await this.tdlVar.tasks(taskCount)
		assert.equal(task.id.toNumber(), taskCount.toNumber())
		//tests on the first task
		assert.equal(task.content, 'This is a great first sample task.')
	    assert.equal(task.isCompleted, false)
	    assert.equal(taskCount.toNumber(), 1)
	})

	it('creates tasks', async () => {
		//the emitted 'TaskCreated' event is contained here.
		const createTaskResult = await this.tdlVar.createTask('This is a new task')
		const taskCount = await this.tdlVar.taskCount()
		assert.equal(taskCount, 2)
		//the first log in logs
		//args key gets the member variables of the event (id, content, isCompleted)
		const event = createTaskResult.logs[0].args
		assert.equal(event.id.toNumber(), 2)
		assert.equal(event.content, 'This is a new task')
		assert(!event.isCompleted)
	})
})