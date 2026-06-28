##
## EPITECH PROJECT, 2026
## Zappy
## File description:
## Makefile for the Zappy Project repository
##

NAME_SERVER =   zappy_server
NAME_AI     =   zappy_ai
NAME_GUI    =   zappy_gui

all: $(NAME_SERVER) $(NAME_AI) $(NAME_GUI)

$(NAME_SERVER):
	@cd server && cargo build --release
	@cp server/target/release/$(NAME_SERVER) .

$(NAME_AI):
	@cmake -S ai/algo -B ai/algo
	@$(MAKE) -C ai/algo
	@cp ai/algo/$(NAME_AI) .

$(NAME_GUI):
	@$(MAKE) -C gui
	@cp gui/bin/app $(NAME_GUI)

clean:
	@cd server && cargo clean
	@$(MAKE) -C ai/algo clean
	@$(MAKE) -C gui clean

fclean: clean
	@rm -f $(NAME_SERVER) $(NAME_AI) $(NAME_GUI)

re: fclean all

.PHONY: all clean fclean re $(NAME_SERVER) $(NAME_AI) $(NAME_GUI)
