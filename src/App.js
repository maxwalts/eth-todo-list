App = {
	//keep track of loading state
	loading: false,
	//a place to put the contracts from loadContract
	contracts: {},

	//load app
	load: async () => {
		console.log("app is loading")
		await App.connectToBlockchainWithWeb3() //member function, can be named whatever
		await App.loadAccount()
		await App.logContract()
		await App.loadContract()
		await App.render()
	},

	// this code comes from https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
	// it is metamask's recommended way of talking to the blockchain with web3.js.
	connectToBlockchainWithWeb3: async () => {
		if (typeof web3 !== 'undefined') {
		  App.web3Provider = web3.currentProvider
		  web3 = new Web3(web3.currentProvider)
		} else {
		  window.alert("Please connect to Metamask.")
		}
		// Modern dapp browsers...
		if (window.ethereum) {
		  window.web3 = new Web3(ethereum)
		  try {
		    // Request account access if needed
		    await ethereum.enable()
		    // Acccounts now exposed
		    web3.eth.sendTransaction({/* ... */})
		  } catch (error) {
		    // User denied account access...
		  }
		}
		// Legacy dapp browsers...
		else if (window.web3) {
		  App.web3Provider = web3.currentProvider
		  window.web3 = new Web3(web3.currentProvider)
		  // Acccounts always exposed
		  web3.eth.sendTransaction({/* ... */})
		}
		// Non-dapp browsers...
		else {
		  console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
		}
	},

	//set the app's account, console.log it
	loadAccount: async () => {
		App.account = web3.eth.accounts[0]
		console.log(App.account)
	},

	//console log the json from compiled contract
	logContract: async () => {
		//"jquery.getJSON"
		//this file is from build/contracts/ and I can access it thanks to my bs-config setup.
		const tdlVar = await $.getJSON('ToDoList.json')
		console.log(tdlVar)
	},

	loadContract: async () => {
		//code from source. 
		// Creates a JavaScript version of the smart contract
		//so I can call functions like createTask, isCompleted,...
	    const tdlVar = await $.getJSON('TodoList.json')
	    App.contracts.ToDoList = TruffleContract(tdlVar)
	    App.contracts.ToDoList.setProvider(App.web3Provider)

	    // similar to how I interacted with contracts in the Truffle Terminal
	    // but the contract is now stored under app.contracts
	    // this "hydrates" the smart contract with values from the blockchain.
	    App.tdlVar = await App.contracts.ToDoList.deployed()
	},

	render: async () => {
	    // Prevent double render
	    if (App.loading) {
	      return
	    }

	    // Update app loading state during this render method
	    App.setLoading(true)

		//renders the account in the right side of the navbar
		// setting the account id
		$('#account').html(App.account)

		//Render the tasks.
		await App.renderTasks()

	    // Update loading state
	    App.setLoading(false)
	},

	renderTasks: async ()=> {
		// Loads the total task count from the blockchain
		const taskCount = await App.tdlVar.taskCount()
		// $taskTemplate is syntax that shows the variable to be a jquery object.
		// taskTemplate is a class, so use '.'
		const $taskTemplate = $('.taskTemplate')

		// render out each task on the page using a new task template
		// 1 is the first valid ID.
		for (var i = 1; i <= taskCount; i++) {
			//fetch each task data (from the blockchain)
			//truffle returns this as an array
			const task = await App.tdlVar.tasks(i)
			//the first object in the array is the ID
			const taskID = task[0].toNumber()
			//second is the content
			const taskContent = task[1]
			//third is the isCompleted state
			const taskIsCompleted = task[2]

			//now, create the HTML for the task
			const $newTaskTemplate = $taskTemplate.clone()
			$newTaskTemplate.find('.content').html(taskContent)
			$newTaskTemplate.find('.input')
							.prop('name', taskID)
							.prop('checked', taskIsCompleted)
							// .on('click', App.toggleCompleted)

			//put the task in the right list 
			//based on isCompleted
			if(taskIsCompleted) {
				$('#completedTaskList').append($newTaskTemplate)
			} else {
				$('#taskList').append($newTaskTemplate)
			}

			//finally, show the task
			$newTaskTemplate.show()
		}

	},

	createTask: async () => {
		//show the loader 
		App.setLoading(true)
		//the input  is id=newTask
		// .val() gets the value of whatever is in the input 
		const content = $('#newTask').val()
		//calling a smart contract function createTask()
		await App.tdlVar.createTask(content)

		// js lingo for 'refresh the page'
		window.location.reload()
	},

	//from source material.
	setLoading: (booleanIn) => {
	    App.loading = booleanIn
	    //"loading.." loader, with id=loader 
	    const loader = $('#loader')
	    //app content, with id=content
	    const content = $('#content')
	    if (booleanIn) {
	      loader.show()
	      content.hide()
	    } else {
	      loader.hide()
	      content.show()
	    }
  }
}

// this is jquery syntax. 
// check the docs here: https://api.jquery.com/ready/ 
// The .ready() method is typically used with an anonymous function
// $( document ).ready(...)
// is the same as 
// $(...)
// when DOM is safe to manipulate
$(() => {
	//when all assets on the page have loaded
	$(window).load(() => {
		App.load()
	})
})
