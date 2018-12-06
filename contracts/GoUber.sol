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
   
    Booking[] bookingList;
    uint public bookingCount;

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

        Booking memory booking;
        booking.passengerAddress = msg.sender;
        booking.passengerInfo = passengerInfo;
        //booking.driverAddress = 0x0;
        booking.driverInfo = "";
        booking.createdAt = block.timestamp;
        booking.originLocation = originLocation;
        booking.destLocation = destLocation;
        booking.totalCost = totalCost;
        booking.passengerPaid = totalCost;
        booking.status = "new";

        bookingList.push(booking);

        emit BookingCreated(bookingList.length);
    }

    function getBooking(uint index) public view returns (address, string memory, address, string memory,
        uint, string memory, string memory, uint, string memory) {

        Booking memory booking = bookingList[index];
        return (
            booking.passengerAddress,
            booking.passengerInfo,
            booking.driverAddress,
            booking.driverInfo,
            booking.createdAt,
            booking.originLocation,
            booking.destLocation,
            booking.totalCost,
            booking.status
        );
    }

    function getBookingCount() public view returns(uint) {
        return bookingList.length;
    }
  
    // passenger can cancel booking, cost will be refund
    function cancelBooking(uint index) public payable {
        Booking memory booking = bookingList[index];

        // validation
        require(msg.sender == booking.passengerAddress && compareStrings(booking.status, "new"));
       
        booking.passengerAddress.transfer(booking.passengerPaid);
        booking.passengerPaid = 0;
        booking.status = "cancelled";

        bookingList[index] = booking;

        emit BookingCancelled(index);
    }

    // driver accepts booking created from passenger
    function acceptBooking(uint index, string memory driverInfo) public {
        Booking memory booking = bookingList[index];

        // validation
        require(booking.driverAddress == 0x0000000000000000000000000000000000000000 && compareStrings(booking.status, "new"));
    
        booking.driverAddress = msg.sender;
        booking.driverInfo = driverInfo;
        booking.status = "ontrip"; 

        bookingList[index] = booking;

        emit BookingAccepted(index);
    }

    // passenger must to confirm trip completed
    function completeBooking(uint index) public {
        Booking memory booking = bookingList[index];

        // validation
        require(msg.sender == booking.passengerAddress && compareStrings(booking.status, "ontrip"));
       
        booking.driverAddress.transfer(booking.passengerPaid);
        booking.status = "completed";
        booking.passengerPaid = 0;

        bookingList[index] = booking;
		
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