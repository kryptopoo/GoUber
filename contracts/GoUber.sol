pragma solidity ^0.4.24;

contract GoUber {
    struct Booking {
        address passengerAddress;
        string passengerInfo;
        address driverAddress;
        string driverInfo;
        uint createdAt;
        string originLocation;
        string destLocation;
        uint totalCost;
        string status; // new, cancelled, accepted, ontrip, completed
    }
   
    Booking[] internal bookings;

    // declare events
    event BookingCreated(uint bookingIndex);
    event BookingAccepted(uint bookingIndex);
    event BookingCompleted(uint bookingIndex);
    event BookingCancelled(uint bookingIndex);
   
    // passenger can create a booking
    function createBooking(string memory passengerInfo, string memory originLocation, string memory destLocation) 
        public payable {

        bookings.push(Booking(
            msg.sender, passengerInfo, address(0x0), "", block.timestamp,
            originLocation, destLocation, msg.value, "new"));

        emit BookingCreated(bookings.length);
    }

    function getBooking(uint index) public view returns (address, string memory, address, string memory,
        uint, string memory, string memory, uint, string memory) {
        Booking memory book = bookings[index];
        return (
            book.passengerAddress,
            book.passengerInfo,
            book.driverAddress,
            book.driverInfo,
            book.createdAt,
            book.originLocation,
            book.destLocation,
            book.totalCost,
            book.status
        );
    }

    function getBookingCount() public view returns(uint) {
        return bookings.length;
    }
  
    // passenger can cancel booking, cost will be refund
    function cancelBooking(uint index) public {
        // validation
        require(msg.sender == bookings[index].passengerAddress && compareStrings(bookings[index].status, "new"), "validation failed.");
        bookings[index].passengerAddress.transfer(bookings[index].totalCost);
        bookings[index].status = "cancelled";
        emit BookingCancelled(index);
    }

    // driver accepts booking created from passenger
    function acceptBooking(uint index, string memory driverInfo) public {
        // validation
        require(bookings[index].driverAddress == address(0x0) && compareStrings(bookings[index].status, "new"), "validation failed.");
        bookings[index].driverAddress = msg.sender;
        bookings[index].driverInfo = driverInfo;
        bookings[index].status = "ontrip"; 
        emit BookingAccepted(index);
    }

    // passenger must to confirm trip completed
    function completeBooking(uint index) public {
        // // validation
        require(msg.sender == bookings[index].passengerAddress && compareStrings(bookings[index].status, "ontrip"), "validation failed.");
        bookings[index].driverAddress.transfer(bookings[index].totalCost);
        bookings[index].status = "completed";
        emit BookingCompleted(index);
    }

    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        if(bytes(a).length != bytes(b).length) {
            return false;
        } else {
            return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
        }
    }
}