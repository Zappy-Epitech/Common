##
## EPITECH PROJECT, 2026
## Zappy
## File description:
## Makefile for the Common repository (Server Build)
##

NAME    =   zappy_server

all:
	@cd server && cargo build --release
	@cp server/target/release/$(NAME) .

$(NAME): all

clean:
	@cd server && cargo clean

fclean: clean
	@rm -f $(NAME)

re: fclean all

.PHONY: all clean fclean re
