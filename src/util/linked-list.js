class _Node {
  constructor(value, next) {
    this.value = value;
    this.next = next;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  insertFirst(item) {
    this.head = new _Node(item, this.head);
  }

  insertLast(item) {
    if (this.head === null) {
      this.insertFirst(item);
    } else {
      let tempNode = this.head;
      while (tempNode.next !== null) {
        tempNode = tempNode.next;
      }
      tempNode.next = new _Node(item, null);
    }
  }

  insertAt(value, numPosition) {
    let currNode = this.head;
    if (numPosition === 0) {
      this.head = new _Node(value, currNode.next);
      return;
    }
    let count = 1;
    while (currNode.next !== null) {
      if (count === numPosition) {
        currNode.next = new _Node(value, currNode.next);
        return;
      }
      currNode = currNode.next;
      count++;
    }
    console.error(`Node with position of ${numPosition} does not exist!`);
  }

  find(item) {
    let currNode = this.head;
    if (!this.head) {
      return null;
    }
    while (currNode.value !== item) {
      if (currNode.next === null) {
        return null;
      } else {
        currNode = currNode.next;
      }
    }
    return currNode;
  }

  remove(item) {
    if (!this.head) {
      return null;
    }
    if (this.head.value === item) {
      this.head = this.head.next;
      return;
    }
    let currNode = this.head;
    let previousNode = this.head;

    while (currNode !== null && currNode.value !== item) {
      previousNode = currNode;
      currNode = currNode.next;
    }
    if (currNode === null) {
      console.log('Item not found');
      return;
    }
    previousNode.next = currNode.next;
  }

  display() {
    let currNode = this.head;
    if (currNode === null) {
      console.error('List is empty!');
      return;
    }
    while (currNode.next !== null) {
      console.log(currNode.value);
      currNode = currNode.next;
    }
  
    if (currNode.next === null) {
      console.log(currNode.value);
    }
  }
}

module.exports = LinkedList;