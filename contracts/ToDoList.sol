pragma solidity ^0.5.0;

/**
 * The ToDoList contract does this and that...
 */
contract ToDoList {
  uint public taskCount = 0;

  struct Task {
  	uint id;
  	string content;
  	bool isCompleted;
  }

  mapping (uint => Task) public tasks;

  constructor() public {
  	createTask("This is a great first sample task.");
  }

  function createTask(string memory _content) public {
  	taskCount++;
  	tasks[taskCount] = Task(taskCount, _content, false);
  }

} 