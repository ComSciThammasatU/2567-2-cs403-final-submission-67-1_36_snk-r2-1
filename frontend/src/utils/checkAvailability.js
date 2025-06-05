export const getAvailableSlotsByZone = (events, selectedDate, courts) => {
    const timeSlots = Array.from({ length: 14 }, (_, i) => {
      const hour = 8 + i;
      return {
        start: `${hour.toString().padStart(2, '0')}:00`,
        end: `${(hour + 1).toString().padStart(2, '0')}:00`,
      };
    });
  
    const dateStr = selectedDate.toISOString().split('T')[0];
  
    const availability = {};
  
    courts.forEach((court) => {
      availability[court.name] = [];
  
      timeSlots.forEach(({ start, end }) => {
        const fullStart = `${dateStr} ${start}`;
        const fullEnd = `${dateStr} ${end}`;
  
        const isBooked = events.some(
          (event) => event.title.includes(court.name) && event.start === fullStart && event.end === fullEnd
        );
  
        if (!isBooked) {
          availability[court.name].push(`${start} - ${end}`);
        }
      });
    });
  
    return availability; // Object format: { "Zone A": [...], "Zone B": [...] }
  };
  