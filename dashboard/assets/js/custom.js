    $('.categories li')[0].classList.add('active');

    $('.categories li').on('click', setCategory);

    function setCategory() {
        $('.categories li').removeClass('active');

        $(this).addClass('active');

        $('.commands li').hide();

        const categoryCommands = $(`.commands .${$(this)[0].id}`);
        categoryCommands.show();

        updateResultsText(categoryCommands);
    }

    setCategory.bind($('.categories li')[0])();

    $('#searchBtn button').on('click', () => {
        const query = $('#searchInput input').val();

        const results = new Fuse(commands.map(c => c.config), {
            isCaseSensitive: false,
            keys: [
                {
                    name: 'command',
                    weight: 1
                }
            ]
        }).search(query).map(r => r.item);

        $('.categories li').removeClass('active');
        $('.commands li').hide();

        for (const command of results) {
            $(`#${command.command}Command`).show();
        }

        updateResultsText(results);
    });

    function updateResultsText(arr) {
        $('#commandError').text(
            (arr.length <= 0)
                ? 'Nothing to see here.'
                : '');
    }

    $('.hamburger').on('click', function() {
      $('#sidebarExtension').toggleClass('closed');
    });