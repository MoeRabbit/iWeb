$(function(){
    var regEmail = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;  //邮箱验证
    var errorCheck = {
        email : function(email){
            if(!regEmail.test(email)){
                $('#register-email-tip').text('请输入正确的邮箱地址').css('visibility', 'visible');
                return 0;
            } else {
                $('#register-email-tip').css('visibility', 'hidden');
                return 1;
            }
        },
        password: function(pw){
            if(pw.length < 8 || pw.length > 12){
                $('#register-pw-tip').text('请输入正确的密码，6-12个字符').css('visibility', 'visible');
                return 0;
            } else {
                $('#register-pw-tip').css('visibility', 'hidden');
                return 1;
            }
        },
        nickname: function(nickname){
            if(nickname.length < 2 || nickname.length > 16){
                $('#register-name-tip').text('请输入正确的昵称，2-12个字符').css('visibility', 'visible');
                return 0;
            } else {
                $('#register-name-tip').css('visibility', 'hidden');
                return 1;
            }
        }
    };
    function register(){
        var email = $('#register-email').val(),
            pw = $('#register-pw').val(),
            nickname = $('#register-name').val();

        var checkEmail = errorCheck.email(email);
        var checkPw = errorCheck.password(pw);
        var checkNickname = errorCheck.nickname(nickname);
        if(!checkEmail || !checkPw || !checkNickname){
            return false;
        }
        $.post('/register', {
            name: nickname,
            password: pw,
            email: email
        }, function(res){
            if(res && res.status == 1){
                //window.location.href = window.location.origin;
            } else {
                var code = res.error.code;
                console.log(code);
                switch(code){
                    case 100:
                    case 103:
                        alert('服务器错误,请稍后重试');
                        break;
                    case 101:
                        console.log(code);
                        $('#register-name-tip').text('该昵称已经存在').css('visibility', 'visible');
                        break;
                    case 102:
                        $('#register-email-tip').text('该邮箱已经被注册').css('visibility', 'visible');
                        break;
                    default :
                        alert('服务器错误,请稍后重试!');
                        break;
                }
            }
        });
    }
    $('#register-name').blur(function(){
        errorCheck.nickname($(this).val());
    });
    $('#register-email').blur(function(){
        errorCheck.email($(this).val());
    });
    $('#register-pw').blur(function(){
        errorCheck.password($(this).val());
    });

    $('#register').submit(function(){
        register();
    });
});