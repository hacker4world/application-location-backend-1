export interface CreateReservationDto {
  date_debut: Date;
  date_fin: Date;
  client_id: number;
  vehicle_id: number;
}

export interface UpdateReservationDto {
  date_debut?: Date;
  date_fin?: Date;
  client_id?: number;
  vehicle_id?: number;
}

export interface ReservationFilterDto {
  client_id?: number;
  vehicle_id?: number;
  date_debut_from?: Date;
  date_debut_to?: Date;
  date_fin_from?: Date;
  date_fin_to?: Date;
}

export interface PaginationDto {
  page?: number;
  limit?: number;
}

export interface ListReservationsQueryDto
  extends PaginationDto, ReservationFilterDto {}
