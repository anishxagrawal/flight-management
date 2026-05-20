export interface Airport {
  id: string
  code: string
  name: string
  city: string
  country: string
  timezone: string
  created_at: string
}

export interface Airline {
  id: string
  code: string
  name: string
  logo_url: string | null
  created_at: string
}

export interface Aircraft {
  id: string
  model: string
  manufacturer: string
  total_seats: number
  first_class_seats: number
  business_class_seats: number
  economy_class_seats: number
  created_at: string
}

export type FlightStatus = 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'cancelled' | 'delayed'
export type SeatClass = 'economy' | 'business' | 'first'
export type SeatStatus = 'available' | 'occupied' | 'blocked' | 'selected'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface Flight {
  id: string
  flight_number: string
  airline_id: string
  aircraft_id: string
  origin_airport_id: string
  destination_airport_id: string
  departure_time: string
  arrival_time: string
  base_price: number
  business_price: number | null
  first_class_price: number | null
  status: FlightStatus
  created_at: string
  updated_at: string
  // Joined relations
  airline?: Airline
  aircraft?: Aircraft
  origin_airport?: Airport
  destination_airport?: Airport
}

export interface Seat {
  id: string
  flight_id: string
  seat_number: string
  seat_class: SeatClass
  seat_row: number
  seat_column: string
  is_window: boolean
  is_aisle: boolean
  is_emergency_exit: boolean
  extra_legroom: boolean
  price_modifier: number
  status: SeatStatus
  selected_by: string | null
  selected_at: string | null
  created_at: string
}

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  passport_number: string | null
  nationality: string | null
  date_of_birth: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  user_id: string
  flight_id: string
  pnr_code: string
  status: BookingStatus
  total_price: number
  booking_date: string
  created_at: string
  updated_at: string
  // Joined relations
  flight?: Flight
  passengers?: Passenger[]
}

export interface Passenger {
  id: string
  booking_id: string
  seat_id: string | null
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  passport_number: string | null
  nationality: string | null
  date_of_birth: string | null
  is_primary: boolean
  created_at: string
  // Joined relations
  seat?: Seat
}

export interface FlightSearchParams {
  origin?: string
  destination?: string
  departureDate?: string
  returnDate?: string
  passengers?: number
  seatClass?: SeatClass
}

export interface FlightWithDetails extends Flight {
  airline: Airline
  aircraft: Aircraft
  origin_airport: Airport
  destination_airport: Airport
}

export interface BookingWithDetails extends Booking {
  flight: FlightWithDetails
  passengers: (Passenger & { seat?: Seat })[]
}
