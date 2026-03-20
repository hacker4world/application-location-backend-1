// DTO for creating a client
export interface CreateClientDto {
  first_name: string;
  last_name: string;
  phone_number: string;
  identity_number: string;
}

// DTO for updating a client
export interface UpdateClientDto {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  identity_number?: string;
  total_rentals?: number;
}

// DTO for filtering clients in list query
export interface ClientFilterDto {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  identity_number?: string;
  min_total_rentals?: number;
  max_total_rentals?: number;
}

// DTO for pagination query
export interface PaginationDto {
  page?: number;
  limit?: number;
}

// Combined query params for listing
export interface ListClientsQueryDto extends PaginationDto, ClientFilterDto {}
