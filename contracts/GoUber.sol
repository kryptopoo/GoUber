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
        uint passengerPaid;
        string status; // new, cancelled, accepted, ontrip, completed
    }
   
    Booking[] bookings;

    // declare events
    event BookingCreated(uint bookingIndex);
    event BookingAccepted(uint bookingIndex);
    event BookingCompleted(uint bookingIndex);
    event BookingCancelled(uint bookingIndex);
   
    // passenger can create a booking
    function createBooking(string memory passengerInfo, string memory originLocation, string memory destLocation, uint distance, uint totalCost) 
        public payable {
        // validation
        require(msg.value == totalCost && distance > 0 && totalCost > 0);

        // Booking memory booking;
        // booking.passengerAddress = msg.sender;
        // booking.passengerInfo = passengerInfo;
        // //booking.driverAddress = 0x0;
        // booking.driverInfo = "";
        // booking.createdAt = block.timestamp;
        // booking.originLocation = originLocation;
        // booking.destLocation = destLocation;
        // booking.totalCost = totalCost;
        // booking.passengerPaid = totalCost;
        // booking.status = "new";
        // bookings.push(booking);

        bookings.push(Booking(msg.sender, passengerInfo, 0x0000000000000000000000000000000000000000, "", block.timestamp, originLocation, destLocation, totalCost, totalCost, "new"));

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

    // function getBooking(uint index) public view returns (address, string memory, address, string memory,
    //     string memory, string memory, uint, string memory) {
    //     return (
    //         bookings[index].passengerAddress,
    //         bookings[index].passengerInfo,
    //         bookings[index].driverAddress,
    //         bookings[index].driverInfo,
    //         bookings[index].originLocation,
    //         bookings[index].destLocation,
    //         bookings[index].totalCost,
    //         bookings[index].status
    //     );
    // }

    function getBookingCount() public view returns(uint) {
        return bookings.length;
    }
  
    // passenger can cancel booking, cost will be refund
    function cancelBooking(uint index) public {
        // validation
        require(msg.sender == bookings[index].passengerAddress && compareStrings(bookings[index].status, "new"));
        bookings[index].passengerAddress.transfer(bookings[index].passengerPaid);
        bookings[index].passengerPaid = 0;
        bookings[index].status = "cancelled";
        bookings[index] = bookings[index];
        emit BookingCancelled(index);
    }

    // driver accepts booking created from passenger
    function acceptBooking(uint index, string memory driverInfo) public {
        // validation
        require(bookings[index].driverAddress == 0x0000000000000000000000000000000000000000 && compareStrings(bookings[index].status, "new"));
        bookings[index].driverAddress = msg.sender;
        bookings[index].driverInfo = driverInfo;
        bookings[index].status = "ontrip"; 
        emit BookingAccepted(index);
    }

    // passenger must to confirm trip completed
    function completeBooking(uint index) public {
        // // validation
        require(msg.sender == bookings[index].passengerAddress && compareStrings(bookings[index].status, "ontrip"));
        bookings[index].driverAddress.transfer(bookings[index].passengerPaid);
        bookings[index].status = "completed";
        bookings[index].passengerPaid = 0;
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