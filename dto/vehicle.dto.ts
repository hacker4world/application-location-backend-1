// DTO for creating a vehicle
export interface CreateVehicleDto {
  car_name: string;
  car_registration: string;
  renting_price_per_day: number;
  model: string;
  mileage?: number;
}

// DTO for updating a vehicle
export interface UpdateVehicleDto {
  car_name?: string;
  car_registration?: string;
  renting_price_per_day?: number;
  model?: string;
  mileage?: number;
  status?: string;
}

// DTO for filtering vehicles in list query
export interface VehicleFilterDto {
  car_name?: string;
  car_registration?: string;
  min_price?: number;
  max_price?: number;
  model?: string;
  status?: string;
  min_mileage?: number;
  max_mileage?: number;
}

// DTO for pagination query
export interface PaginationDto {
  page?: number;
  limit?: number;
}

// Combined query params for listing
export interface ListVehiclesQueryDto extends PaginationDto, VehicleFilterDto {}
